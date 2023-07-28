var express = require("express");
var router = express.Router();
//DB
var mongoose = require("mongoose");
const { url } = require("../common/dbconfig");
const userModal = require("../modals/userSchema");
//Bcrypt
const { hashPassword, compare, createToken,validate } = require("../common/auth");

//DB Connection
mongoose.connect(url);
const options={maxTimeMS:15000};
router.get("/",validate, async function (req, res, next) {
  const user = await userModal.find({},null,options);
  try {
    if(user){
      res.send(user);
    }
    else{
      res.send({message:"Not Found"})
    }
  } catch (error) {
    res.send({message:"Internal Error"})
  }
});

router.post("/signup", async (req, res) => {
  const user = await userModal.findOne({ username: req.body.username });
  try {
    if (!user) {
      const hashedPassword = await hashPassword(req.body.password);
      req.body.password = hashedPassword;
      const newUser = await userModal.create(req.body);
    } else {
      res.status(400).send({message:"User already exists"});
    }
    res.status(201).send({message:"Created successfully"});
  } catch (error) {
    res.status(500).send({
      message: "Internal Error",
      error,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await userModal.findOne({ username: req.body.username });
  if (user) {
    if (await compare(req.body.password, user.password)) {
      const token = await createToken({
        username: user.username,
        email: user.email,
        phone: user.phone,
        id:user._id
      });
      res.status(200).send({ message: "User Login SuccessFul", token });
    } else {
      res.status(402).send({ message: "Invalid Credentials" });
    }
  } else {
    res.status(400).send({ message: "User Not Found" });
  }
  } catch (error) {
    res.status(500).send({message:"Internal error"})
  }
});

router.put('/:id',async(req,res)=>{
  try {
    let user= await userModal.findOne({_id:req.params.id})
  if(user){
    //Do not update like this --!
    // let user= await userModel.updateOne({_id:req.params.id},req.body)
    user.username=req.body.username
    user.email=req.body.email
    user.password=req.body.password
    user.phone=req.body.phone

    await user.save()
    res.status(200).send({message:"User updated"})
  }
  else{
    res.status(400).send({message:"User not found"})
  }
  } catch (error) {
    res.status(400).send({message:"Internal Error",error})
  }
})

router.delete('/:id',async(req,res)=>{
  const user= await userModal.findOne({_id:req.params.id})
  if(user){
    await user.deleteOne()
    res.status(200).send({message:"User Deleted"})
  }
  else{
    res.status(400).send({message:"User not found"})
  }
})


module.exports = router;
