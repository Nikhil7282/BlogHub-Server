var express = require("express");
var router = express.Router();
//DB
var mongoose = require("mongoose");
const { url } = require("../common/dbconfig");
const blogModal = require("../modals/blogSchema");
const jwt=require('jsonwebtoken')
//Bcrypt
const {validate } = require("../common/auth");

//DB Connection
mongoose.connect(url);

router.get('/',async(req,res)=>{
    const blogs=await blogModal.find({})
    res.send(blogs)
})

router.get('/userpost',validate, async(req,res)=>{
    // res.send("Hello")
    const token=req.headers.authorization.split(" ")[1]
    // console.log(token)
    let data=await jwt.decode(token)
    // console.log(data)
    if(data){
        const userBlogs=await blogModal.find({user:data.id})
    // console.log(userBlogs)
    res.send(userBlogs)
    }
    else{
        res.send({message:"Internal Error"})
    }
})

router.post('/',async(req,res)=>{
    const blog=await blogModal.findOne({title:req.body.title,user:req.body.user})
    if(blog){
        res.status(400).send({message:"The Title of the post is already used"})
    }
    else{
    const newBlog=await blogModal.create(req.body)
    res.status(200).send({message:"Blog Post Added"})
    }
})

router.put('/updatePost/:id',async(req,res)=>{
    const {title,description,content}=req.body
    const id=req.params.id
    // console.log(content[0])
    const blog=await blogModal.findOne({_id:id})
    if(blog){
        try {
            blog.title=title
            blog.description=description
            blog.content=content
            await blog.save()
            // const posts=await blogModal.updateOne({user:id},{$set:{title:title,description:description,content:content}})
            // console.log(content[0]+"qwerty")
            res.json({message:"Post updated"})
        } catch (error) {
            console.log(error)
        }
    }
    else{
        res.status(400).send({message:"Post not found"})
    }
})

router.delete('/deletePost/:id',async(req,res)=>{
    const id=req.params.id
    const posts=await blogModal.deleteOne({_id:id})
    res.json({message:"Post Deleted"})
})



module.exports = router;
