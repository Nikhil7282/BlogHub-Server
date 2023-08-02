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

mongoose.connect(url)
.then((response)=>{
    console.log("Db Connected")
})
.catch((error)=>{
    console.log(error);
})

const options={maxTimeMS:15000};
router.get('/',async(req,res)=>{
    const blogs=await blogModal.find({},null,options)
    try {
        if(blogs){
          res.send(blogs);
        }
        else{
          res.send({message:"Not Found"})
        }
      } catch (error) {
        throw error
        // res.send({message:"Internal Error"})
      }
    // blogModal.find({},null,options)
    // .then((response)=>{
    //     if(response){
    //         res.send()
    //     }
    // })
})

router.get('/userpost',validate, async(req,res)=>{
    try {
        // res.send("Hello")
    const token=req.headers.authorization.split(" ")[1]
    // console.log(token)
    let data=await jwt.decode(token)
    // console.log(data)
    if(data){
        const userBlogs=await blogModal.find({user:data.id},null,options)
    // console.log(userBlogs)
    res.status(200).send(userBlogs)
    }
    else{
        res.status(400).send({message:"No Token Found"})
    }
    } catch (error) {
        throw error
        // res.status(500).send({message:"Internal Error"})
    }
})

router.post('/',validate,async(req,res)=>{
    try {
        const blog=await blogModal.findOne({title:req.body.title,user:req.body.user})
    if(blog){
        res.status(400).send({message:"The Title of the post is already used"})
    }
    else{
    const newBlog=await blogModal.create(req.body)
    res.status(200).send({message:"Blog Posted"})
    }
    } catch (error) {
        throw error
        // res.status(500).send({message:"Internal Error"})
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
            throw error
            // console.log(error)
        }
    }
    else{
        res.status(400).send({message:"Post not found"})
    }
})

router.delete('/deletePost/:id',validate,async(req,res)=>{
    // const userId=req.body.user
    try {
        const postId=req.params.id
    const post=await blogModal.findOne({_id:postId})
    if(post){
    const posts=await blogModal.deleteOne({_id:postId})
    res.status(200).send({message:"Post Deleted"})
    }
    else{
        res.status(400).send({message:"Post Not Found"})
    }
    } catch (error) {
        throw error
        // res.status(500).send({message:"Internal Error"})
    }
    // console.log(postId)
    // console.log(userId)
    
    // const posts=await blogModal.deleteOne({$and:[{_id:postId},{user:userId}]})
    // console.log(posts)
})



module.exports = router;
