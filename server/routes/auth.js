import express from 'express';
import { signUp,logIn,logOut} from '../controllers/authController.js';

const authRouter=express.Router();

authRouter.post('/signup',signUp);

authRouter.post('/login',logIn);

authRouter.post('/logout',logOut);




export default authRouter;