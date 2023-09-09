const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const secretKey=process.env.secretKey

const hashPassword=async(password)=>{
    const salt=await bcrypt.genSalt(8)
    let hashedPassword=await bcrypt.hash(password,salt)
    console.log(hashedPassword)
    return hashedPassword
}

const compare=async(password,hashedPassword)=>{
    return bcrypt.compare(password,hashedPassword)
}

const createToken=async(payload)=>{
    const token=await jwt.sign(payload,secretKey,{expiresIn:'24h'})
    return token
}

const validate=async(req,res,next)=>{
    // console.log(req)
    // console.log(req.body);
    console.log(req.headers);
    // console.log(req.headers.authorization);
    if(req.headers.authorization){
        const token=req.headers.authorization.split(" ")[1]
        let data=await jwt.decode(token)
        console.log(data);
        if(Math.floor((+new Date())/1000)<data.exp){
            req.body.user=data.id
            req.body.name=data.username
            next()
        }
        else{
            // console.log("Token Expired");
            res.status(401).send({message:"Token Expired"})
        }
    }
    else{
        // console.log("Token not Found");
        res.status(400).send({message:"Token not found"})
    }
}

module.exports={hashPassword,compare,createToken,validate}