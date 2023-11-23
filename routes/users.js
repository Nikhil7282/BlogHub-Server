var express = require("express");
var router = express.Router();
//DB
var mongoose = require("mongoose");
const { url } = require("../common/dbconfig");
const userModal = require("../modals/userSchema");
const jwt = require("jsonwebtoken");
const secretKey = process.env.secretKey;
const nodemailer = require("nodemailer");
//Bcrypt
const {
  hashPassword,
  compare,
  createToken,
  validate,
  decodeToken,
  verifyToken,
} = require("../common/auth");

//DB Connection
mongoose.connect(url);
const options = { maxTimeMS: 15000 };

router.get("/", validate, function (req, res, next) {
  userModal
    .find({}, null, options)
    .then((response) => {
      // console.log(response);
      if (response || response._id) {
        res.status(200).send(response);
      } else {
        res.status(400).send({ message: "Not Found" });
      }
    })
    .catch((error) => {
      throw error;
      // res.status(500).send({message:"Internal Error"})
    });
  // try {
  //   if(user){
  //     res.send(user);
  //   }
  //   else{
  //     res.send({message:"Not Found"})
  //   }
  // } catch (error) {
  //   res.send({message:"Internal Error"})
  // }
});

router.post("/signup", async (req, res) => {
  const user = await userModal.findOne({ username: req.body.username });

  // if(!user){
  //     const hashedPassword = await hashPassword(req.body.password);
  //     req.body.password = hashedPassword;
  //     userModal.create(req.body)
  //     .then((response)=>{
  //       if(response && response._id){
  //         res.status(200).send({message:"Created Successfully"})
  //       }
  //     })

  // }
  try {
    if (!user) {
      const hashedPassword = await hashPassword(req.body.password);
      req.body.password = hashedPassword;
      const newUser = await userModal.create(req.body);
    } else {
      res.status(400).send({ message: "User already exists" });
    }
    res.status(201).send({ message: "Created successfully" });
  } catch (error) {
    throw error;
    // res.status(500).send({
    //   message: "Internal Error",
    //   error,
    // });
  }
});

router.post("/login", async (req, res) => {
  const user = await userModal.findOne({ username: req.body.username });
  try {
    if (user) {
      if (await compare(req.body.password, user.password)) {
        const token = await createToken({
          username: user.username,
          email: user.email,
          phone: user.phone,
          id: user._id,
        });
        // res.status(200).send({message:"User Login SuccessFul",token})
        res.status(200).json({
          message: "User Login SuccessFul",
          token: token,
          userId: user._id,
          username: user.username,
        });
      } else {
        res.status(402).send({ message: "Invalid Credentials" });
      }
    } else {
      res.status(400).send({ message: "User Not Found" });
    }
  } catch (error) {
    console.log(error);
    // throw error
    return res.status(500).send({ message: "Internal error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    let user = await userModal.findOne({ _id: req.params.id });
    if (user) {
      //Do not update like this --!
      // let user= await userModel.updateOne({_id:req.params.id},req.body)
      user.username = req.body.username;
      user.email = req.body.email;
      user.password = req.body.password;
      user.phone = req.body.phone;

      await user.save();
      res.status(200).send({ message: "User updated" });
    } else {
      res.status(400).send({ message: "User not found" });
    }
  } catch (error) {
    throw error;
    // res.status(400).send({message:"Internal Error",error})
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await userModal.findOne({ _id: req.params.id });
    if (user) {
      await user.deleteOne();
      res.status(200).send({ message: "User Deleted" });
    } else {
      res.status(400).send({ message: "User not found" });
    }
  } catch (error) {
    throw error;
  }
});

//forget-Password
router.post("/forgetPassword", async (req, res) => {
  // console.log(req.body.email);
  const user = await userModal.findOne({ email: req.body.email });
  // console.log(user);
  if (user) {
    const token = await createToken({ id: user._id });
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nikhil.sa2020ece@sece.ac.in",
        pass: "Nikhilsa@2003",
      },
    });

    var mailOptions = {
      from: "bloghub96@gmail.com",
      to: `${req.body.email}`,
      subject: "Reset your password",
      text: `http://localhost:3000/resetPassword/${token}`,
      html: `
      <h1>Please try to remember the password...🤦‍♂️</h1>
      <h3>Reset Password For the username ${user.username}</h3>
      <a href="http://localhost:3000/resetPassword/${token}">👉Click here to reset Password</a>
      <h2>The link is valid upto 10 hours</h2>
      <h3>🙅‍♂️Try not to share the link🙅‍♂️</h3>
      `,

    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({ message: "Check Your Mail" });
      }
    });
  } else {
    return res.status(400).json({ message: "User Doesn't Exist" });
  }
});

router.post("/resetPassword/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const data = await decodeToken(token);
  // console.log(data);
  await jwt.verify(token, secretKey, async (err, decoded) => {
    if (err) {
      // console.log(err);
      return res.json({ message: "Token Error" });
    } else {
      const hashedPassword = await hashPassword(password);
      userModal
        .findByIdAndUpdate({ _id: data.id }, { password: hashedPassword })
        .then((r) => {
          return res
            .status(200)
            .json({ message: "Password Updated Successfully" });
        })
        .catch((er) => {
          // console.log(er);
          return res.status(500).json({ message: "Internal Error", data: err });
        });
    }
  });
});

module.exports = router;
