const userModel=require("../models/user.model")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
async function Register(req,res) {
    const {username,email,password}=req.body
    try {
    const isAlreadyUser=await userModel.findOne(
        {
            $or:[
                {username},{email}
            ]
        })
    if(isAlreadyUser)
    {
        return res.status(500).json({message:"User already exists"})
    }
     const hash= await bcrypt.hash(password,10)
        const user=await userModel.create({
        username,email,password:hash
    })
    const token=jwt.sign({
     id:user._id
    },process.env.JWT_SECRET_KEY,{expiresIn:"1h"})
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none",    // required for cross-domain
    secure: true,        // required when sameSite is "none"
})
    return res.status(200).json({
        message:"User successfull registered"
    })
    } catch (error) {
    console.log("Register error:", error.message)
    return res.status(500).json({message: error.message})
}
}

async function login(req,res) {
    const{username,email,password}=req.body
    try {
    const user=await userModel.findOne({
        $or:[
            {username},{email}
        ]
    })
    if(!user)
    {
        return res.status(401).json({message:"User does not exist"})
    }
    const ispassword=await bcrypt.compare(password,user.password)
    if(!ispassword)
    {
        return res.status(401).json({message:"Incorrect password"})
    }
     const token=jwt.sign({
     id:user._id
    },process.env.JWT_SECRET_KEY,{expiresIn:"1h"})
    res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 60 * 60 * 1000 // 1 hour
})  
    return res.status(200).json({
        message:"Login successfull",
        user: { id: user._id, username: user.username, email: user.email }
    })
    } catch (error) {
       return res.status(401).json({message:"User does not exist"})
    }    
}
async function logOut(req,res) {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
    })
    return res.status(200).json({message:"User successfully logged out"})
}

async function checkAuth(req,res) {
    try {
        const user=await userModel.findById(req.user.id).select("-password")
        if(!user)
        {
            return res.status(404).json({message:"User not found"})
        }
        return res.status(200).json({user})
    } catch (error) {
        return res.status(401).json({message:"Unauthorized"})
    }
}

module.exports={Register,login,logOut,checkAuth}