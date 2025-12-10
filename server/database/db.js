import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config();




const DbConnection=async()=>{
    const MONGO_URI=process.env.MONGODB_URL;

    if(!MONGO_URI){
        console.error('MONGODB_URL environment variable is not define');
        process.exit(1);
    }
    try{
        await mongoose.connect(MONGO_URI);
        console.log('database connected successfully');
    }
    catch(error){
   console.log('error while connecting to database ',error.message);
   process.exit(1);
    }

}
export default DbConnection;