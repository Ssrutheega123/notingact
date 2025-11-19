const express=require('express')
const mongoose=require('mongoose');
const cors=require('cors');
require('dotenv').config();

const app=express();
app.use(cors());
app.use(express.json());

// Root route handler to fix "Cannot GET /" error
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to NotingAct API', 
        endpoints: {
            'GET /notes': 'Get all notes',
            'POST /notes': 'Create a new note',
            'PUT /notes/:id': 'Update a note',
            'DELETE /notes/:id': 'Delete a note'
        }
    });
});

// MongoDB connection - use environment variable
// Format: mongodb+srv://username:password@cluster0.2ryjrua.mongodb.net/database_name
const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://ssruth:ssrutheega@cluster0.2ryjrua.mongodb.net/notes";

mongoose.connect(MONGO_URL)
    .then(()=> {
        console.log("MongoDB connected successfully");
    })
    .catch((err)=> {
        console.error("MongoDB Connection error:", err.message);
        // Don't exit - let the server start even if MongoDB fails initially
    });      

const notesSchema= new mongoose.Schema({
    title:{
        type:String,
        required:[true, 'Title is required'],
        trim:true
    },
    content:{
        type:String,
        trim:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date
    }
});

notesSchema.pre('save',function(next){
    this.updatedAt=Date.now();
    next();
});

const Note=mongoose.model("Note",notesSchema);

app.get("/notes",async (req,res)=>{
    try{
        const notes=await Note.find().sort({createdAt: -1});
        res.json(notes);
    }catch(err){
        console.error("Error fetching notes:", err);
        res.status(500).json({message:"Server error while fetching notes", error: err.message});    
    }
});

app.post('/notes',async (req,res)=>{
    try {
        // Input validation
        if (!req.body.title || req.body.title.trim() === '') {
            return res.status(400).json({message: 'Title is required'});
        }

        const newNote=new Note({
            title:req.body.title.trim(),
            content:req.body.content ? req.body.content.trim() : ''
        });
        await newNote.save();
        res.status(201).json({message:'note created successfully',note:newNote});   
    } catch(err) {
        console.error("Error creating note:", err);
        res.status(500).json({message:"Server error while creating note", error: err.message});
    }
});

app.put('/notes/:id', async (req,res)=>{
    try{
        const {id}=req.params;
        const {title,content}=req.body;

        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid note ID format"});
        }

        const note=await Note.findById(id);

        if(!note) return res.status(404).json({message:"notes not found"});     
        
        if(title!==undefined && title!==null) note.title=title.trim();
        if(content!==undefined && content!==null) note.content=content.trim();
        note.updatedAt=Date.now();

        await note.save();
        res.json({message:"note updated successfully",note});
    }catch(err){
        console.error("Error updating note:", err);
        res.status(500).json({message:"internal server error", error: err.message});
    }
});

app.delete('/notes/:id',async (req,res)=>{
    try{
        const {id}=req.params;
        
        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({message: "Invalid note ID format"});
        }

        const note=await Note.findByIdAndDelete(id);
        if(!note) return res.status(404).json({message:'notes not found'});     
        res.json({message:'note deleted successfully', deletedNote: note});
    }catch(err){
        console.error("Error deleting note:", err);
        res.status(500).json({message:"internal server error", error: err.message});
    }
})

// Use Render's PORT environment variable, fallback to 8080 for local development
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`server is cooking at port ${PORT}`);
});

