import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import DbConnection from './database/db.js';
import authRouter from './routes/auth.js';
import tasksRouter from './routes/tasks.js';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initSocket } from './socket.js';

dotenv.config();


const app=express();
const httpServer=createServer(app);
app.use(cookieParser());
app.use(cors({
    origin:["http://localhost:5173","http://localhost:5174",'http://localhost:8080'],
    credentials:true,
}));


 app.use(express.json());
 //routersss
app.use('/api/auth',authRouter);
app.use('/api/tasks',tasksRouter);

const port=process.env.PORT;

 DbConnection();
 initSocket(httpServer);

 httpServer.listen(port,(req,res)=>{
     console.log(`Listening on port ${port}`)
 })