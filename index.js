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
const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://<db_username>:<db_password>@cluster0.2ryjrua.mongodb.net/";

mongoose.connect(MONGO_URL)
    .then(()=> console.log("MongoDB connected"))
    .catch((err)=> console.error("MongoDB Connection error",err.message));      

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
        const notes=await Note.find().sort({})
        res.json(notes);
    }catch(err){
        res.status(500).json({message:"Server error while fetching notes"});    
    }
});

app.post('/notes',async (req,res)=>{
    try {
        const newNote=new Note({
            title:req.body.title,
            content:req.body.content
        });
        await newNote.save();
        res.status(201).json({message:'note created successfully',note:newNote});   
    } catch(err) {
        res.status(500).json({message:"Server error while creating note", error: err.message});
    }
});

app.put('/notes/:id', async (req,res)=>{
    try{
        const {id}=req.params;
        const {title,content}=req.body;

        const note=await Note.findById(id);

        if(!note) return res.status(404).json({message:"notes not found"});     
        if(title!==undefined) note.title=title;
        if(content!==undefined) note.content=content;
        note.updatedAt=Date.now();

        await note.save();
        res.json({message:"note updated successfully",note});
    }catch(err){
        res.status(500).json({message:"internal server error"});
    }
});

app.delete('/notes/:id',async (req,res)=>{
    try{
        const {id}=req.params;
        const note=await Note.findByIdAndDelete(id);
        if(!note) return res.status(404).json({message:'notes not found'});     
        res.json({message:'note deleted successfully'});
    }catch(err){
        res.status(500).json({message:"internal server error"});
    }
})

// Use Render's PORT environment variable, fallback to 8080 for local development
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`server is cooking at port ${PORT}`);
});
