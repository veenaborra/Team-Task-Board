import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

const JWT_SECRET=process.env.JWT_SECRET;

//user registration
export const signUp=async(req,res)=>{
    try{
        const {username,email,password}=req.body;

        const existingUser=await User.findOne({$or:[{email},{username}]});
        if (existingUser) {
            const conflictField = existingUser.email === email ? 'Email' : 'Username';
            return res.status(400).json({ message: `${conflictField} already exists` });
          }
     

        


        const salt=await bcrypt.genSalt(10);
        const passwordHash=await bcrypt.hash(password,salt);

        const adminEmails=process.env.ADMIN_EMAILS?process.env.ADMIN_EMAILS.split(',').map(email=>email.trim().toLowerCase()):[];
          let role="user";
          if(adminEmails.includes(email.toLowerCase())){
            role="admin";
          }
        const newUser=new User({
            username,
            email,
            passwordHash,
            role
        })

        await newUser.save();

        res.status(201).json({message:'User registered suceessfully'});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:'something went wrong ',error:error.message})
        
    }
};

//user login
export const logIn=async(req,res)=>{
try{
    const {emailOrUsername,password}=req.body;

const user=await User.findOne({
    $or:[{email:emailOrUsername},{username:emailOrUsername}]});
if(!user){
  return res.status(400).json({message:'invalid credentials'});
}

const isMatch=await bcrypt.compare(password,user.passwordHash);
if(!isMatch){
    return res.status(400).json({message:'Invalid password'});
}
const token=jwt.sign({
    userId:user._id,
    role:user.role
},JWT_SECRET,{expiresIn:"1d"});

res.cookie('token', token, {
    httpOnly: true,
    secure: false, // only true in production with HTTPS
    sameSite: "Lax", // or "Strict" for localhost
    // domain: not set for localhost
    maxAge: 24 * 60 * 60 * 1000  
})
res.status(200).json({ message: "Login successful ",userId:user._id,role:user.role});
}

catch(error){
    console.log(error);
    res.status(500).json({message:"something went wrong",error:error.message})
}
};
//user logout
export const logOut=(req,res)=>{
    res.clearCookie("token",{
        httpOnly:true,
        secure:false,
       
        sameSite:"Lax"
    })
    res.status(200).json({ message: "Logged out successfully" });
}