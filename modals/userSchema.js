const mongoose=require('mongoose')
const validator=require('validator')

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        validate:(val)=>{return validator.isEmail(val)}
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
        validate:(val)=>{return validator.isMobilePhone(val,'en-IN')}
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
},
{
    versionKey:false
})

const userModal=mongoose.model('users',userSchema)
module.exports=userModal