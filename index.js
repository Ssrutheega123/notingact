const express=require('express')
const mongoose=require('mongoose');
const cors=require('cors');
require('dotenv').config();

const app=express();
app.use(cors());
app.use(express.json());

const MONGO_URL="mongodb+srv://<db_username>:<db_password>@cluster0.2ryjrua.mongodb.net/";

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
        type:Data,
        default:Date.now
    },
    updatedaT4:{
        type:Date
    }
}); 

notesSchema.pre('save',function(next){
    this.updatedaT4=Date.now();
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

let notes=[
    {id:1,title:'learn node.js',content:'understanding express'},
    {id:2,title:'practice rest api',content:'use postman to test your api'}
]

app.post('/notes',async (req,res)=>{
    const newNote=new Note({
        title:req.body.title,
        content:req.body.content
    });
    await newNote.save();
    
    res.status(201).json({message:'note created successfully',note:newNote});
});
app.put('/notes/:id', async (req,res)=>{

    try{
        const {id}=req.params;
        const {title,content}=req.body;

        const note=await Note.findById(id);

        if(!note) return res.status(404).json({message:"notes not found"});
        if(title!==undefined) note.title=title;
        if(!content!==undefined) note.content=content;
        note.updatedaT4=Date.now();

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
const PORT=8080;
app.listen(PORT,()=>{
    console.log("server is cooking at port 5067");
});

//mongodb+srv://<db_username>:<db_password>@cluster0.2ryjrua.mongodb.net/
