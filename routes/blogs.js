var express = require("express");
var router = express.Router();

const userModal = require("../models/userSchema");
const blogModal = require("../models/blogSchema");
const commentModal = require("../models/commentSchema");
const jwt = require("jsonwebtoken");
//Bcrypt
const { validate } = require("../common/auth");

router.get("/", async (req, res) => {
  const blogs = await blogModal.find({});
  try {
    if (blogs) {
      res.send(blogs);
    } else {
      res.send({ message: "Not Found" });
    }
  } catch (error) {
    throw error;
  }
});

router.get("/userpost", validate, async (req, res) => {
  try {
    // res.send("Hello")
    const token = req.headers.authorization.split(" ")[1];
    // console.log(token)
    let data = await jwt.decode(token);
    // console.log(data)
    if (data) {
      const userBlogs = await blogModal.find({ user: data.id }, null, options);
      // console.log(userBlogs)
      res.status(200).send(userBlogs);
    } else {
      res.status(400).send({ message: "No Token Found" });
    }
  } catch (error) {
    throw error;
  }
});

router.get("/savedPosts", async (req, res) => {
  const query = req.query.populate;
  try {
    const token = req.headers.authorization.split(" ")[1];
    let data = jwt.decode(token);
    if (!data) {
      return res.status(400).json({ message: "No Token Found" });
    }
    const user = await userModal.findOne({ _id: data.id });
    if (!user) {
      return res.status(401).json({ message: "Invalid User" });
    }
    if (query === "false") {
      return res
        .status(200)
        .json({ message: "Success", data: user.savedBlogs });
    }
    let saved = await user.populate("savedBlogs", "-password");
    // console.log(saved);
    return res.status(200).json({ message: "Success", data: saved });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error: error });
  }
});

router.post("/addSavedPost", async (req, res) => {
  const { blogId } = req.body;
  try {
    const token = req.headers.authorization.split(" ")[1];
    let data = await jwt.decode(token);
    if (data) {
      let user = await userModal.findById({ _id: data.id });
      if (user) {
        if (user.savedBlogs.includes(blogId)) {
          return res.status(401).json({ message: "Already Saved" });
        } else {
          user.savedBlogs.push(blogId);
          await user.save();
          return res
            .status(200)
            .json({ message: "Blog Saved", data: user.savedBlogs });
        }
      } else {
        return res.status(400).json({ message: "Invalid User" });
      }
    }
    return res.status(404).json({ message: "Invalid Token" });
  } catch (error) {
    return res.status(500).json({ message: "server error", error: error });
  }
});

router.delete("/removeSavedPosts/:id", async (req, res) => {
  const blogId = req.params.id;
  console.log("BlogId", blogId);
  try {
    const token = req.headers.authorization.split(" ")[1];
    let data = await jwt.decode(token);
    if (data) {
      let user = await userModal.findById({ _id: data.id });
      if (user) {
        if (!user.savedBlogs.includes(blogId)) {
          return res.status(401).json({ message: "Post Not Saved" });
        } else {
          let index = user.savedBlogs.indexOf(blogId);
          console.log(index);
          console.log(user.savedBlogs.splice(index, 1));
          user.savedBlogs.slice(index, 1);
          await user.save();
          return res
            .status(200)
            .json({ message: "Blog UnSaved", data: user.savedBlogs });
        }
      } else {
        return res.status(400).json({ message: "Invalid User" });
      }
    }
    return res.status(404).json({ message: "Invalid Token" });
  } catch (error) {
    return res.status(500).json({ message: "server error", error: error });
  }
});

router.post("/", validate, async (req, res) => {
  try {
    const blog = await blogModal.findOne({
      title: req.body.title,
      user: req.body.user,
    });
    if (blog) {
      res
        .status(400)
        .send({ message: "The Title of the post is already used" });
    } else {
      const newBlog = await blogModal.create({
        ...req.body,
        userDetails: { name: req.body.name },
      });
      console.log(newBlog);
      res.status(200).send({ message: "Blog Posted", data: newBlog });
    }
  } catch (error) {
    throw error;
  }
});

router.put("/updatePost/:id", async (req, res) => {
  const { title, description, content } = req.body;
  const id = req.params.id;
  const blog = await blogModal.findOne({ _id: id });
  if (blog) {
    try {
      blog.title = title;
      blog.description = description;
      blog.content = content;
      await blog.save();
      res.json({ message: "Post updated" });
    } catch (error) {
      throw error;
    }
  } else {
    res.status(400).send({ message: "Post not found" });
  }
});

router.delete("/deletePost/:id", validate, async (req, res) => {
  // const userId=req.body.user
  try {
    const postId = req.params.id;
    const post = await blogModal.findOne({ _id: postId });
    if (post) {
      const user = await userModal.findOne({ _id: req.body.user });
      const index = user.savedBlogs.indexOf(postId);
      if (index != -1) {
        user.savedBlogs.splice(index, 1);
        await user.save();
      }
      const posts = await blogModal.deleteOne({ _id: postId });
      res.status(200).send({ message: "Post Deleted" });
    } else {
      res.status(400).send({ message: "Post Not Found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Server Error" });
  }
});

//liking a post
router.post("/likePost/:id", validate, async (req, res) => {
  try {
    const blog = await blogModal.findOne({ _id: req.params.id });
    // console.log(blog)
    if (!blog) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    // console.log(req.user);
    const like = await blog.likes.some((user) => user === req.user);
    console.log("Like:" + like);
    // if(like){
    //   // return res.redirect(`/unLikePost/${req.params.id}`)
    //   return res.status(400).json({message:"Post Already Liked"})
    // }
    if (!like) {
      blog.likes.push(req.body.user);
      await blog.save();
      // console.log(blog);
      return res.status(200).json({ likes: blog.likes.length });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Error" });
  }
});

router.post("/unLikePost/:id", validate, async (req, res) => {
  console.log(req.params.id);
  try {
    const blog = await blogModal.findOne({ _id: req.params.id });
    // console.log(blog)
    if (!blog) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    const index = blog.likes.indexOf(req.body.user);
    if (index != -1) {
      blog.likes.splice(index, 1);
      await blog.save();
    }
    return res.status(200).json({ likes: blog.likes.length });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Error" });
  }
});

//Comments
router.post("/comment/:id", async (req, res) => {
  try {
    const blog = await blogModal.findOne({ _id: req.params.id });
    if (!blog) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    const newComment = await commentModal.create(req.body);
    // console.log(newComment);
    await blogModal.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { comments: newComment._id } }
    );
    res.status(200).json({ message: "Comment Added", comment: newComment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Error" });
  }
});

router.delete("/comment/:id", validate, async (req, res) => {
  console.log(req.body);
  try {
    const blog = await blogModal.findOne({ _id: req.params.id });
    if (!blog) {
      return res.json({ message: "Post Not Found" });
    }
    const comment = await commentModal.findOne({ _id: req.body.commentId });
    if (!comment) {
      return res.json({ message: "Comment Not Found" });
    } else {
      await commentModal.deleteOne({ _id: req.body.commentId });
      await blogModal.findOneAndUpdate(
        { _id: req.params.id },
        { $pull: { comments: req.body.commentId } }
      );
      return res.status(200).json({ message: "Comment Deleted" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Error" });
  }
});

router.get("/comment/:id", async (req, res) => {
  try {
    const blog = await blogModal.findOne({ _id: req.params.id });
    if (!blog) {
      return res.json({ message: "Post Not Found" });
    }
    const comments = await blogModal
      .findById(req.params.id)
      .populate("comments");
    // console.log(blogPost.comments);
    return res.status(200).json({ comments: comments.comments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Error" });
  }
});

module.exports = router;
