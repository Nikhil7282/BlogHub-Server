const mongoose=require('mongoose')
const validator=require('validator')

const blogSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    content:{
        type:String,
        required:true,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
},
{
    versionKey:false
})

const blogModal=mongoose.model('blogs',blogSchema)
module.exports=blogModal