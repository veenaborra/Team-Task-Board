import mongoose from "mongoose";



const userSchema=new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true,
       
    },
    email:{
        type:String,
        unique:true,
        required:true,
    },
    passwordHash:{
        type:String,
        required:true
    },
    role:{
        type:String,
        required:true,
        enum:['user','admin'],
    },
    joinedAt:{
        type:Date,
        default:Date.now(),
    },

    

});

const User=mongoose.model('User',userSchema);

export default User;