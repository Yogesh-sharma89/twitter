import express from 'express';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express'
import ConnectToDb from './config/db.js';
import userRoutes from './routes/user.js';
import cors from 'cors';
import postRoutes from './routes/post.js'
import commentRoutes from './routes/comment.js';
import notificationRoutes from './routes/notification.js';
import ArcjetMiddleware from './middleware/arcjet.middleware.js';

dotenv.config();

const app = express();

const port  = process.env.PORT || 3000;

app.use(express.json());
app.use(clerkMiddleware())
app.use(cors());

//arcjet middleware 
app.use(ArcjetMiddleware);

app.get('/',(req,res)=>{
    return res.json({message:'Server is up and running properly'})
})

app.use('/api/users',userRoutes);
app.use('/api/posts',postRoutes);
app.use('/api/comments',commentRoutes);
app.use('/api/notifications',notificationRoutes);

app.use((err,req,res,next)=>{
    console.log('Error : '+err.message);
    return res.status(500).json({message:err.message || 'Internal server error.'})
})

const StartConnection = async ()=>{
    try{
        await ConnectToDb();

        if(process.env.NODE_ENV!=='production'){
              app.listen(port,()=>{
                    console.log('Server is up and listening at 3000 👍⚡')
                })
        }

    }catch(err){
        console.log('Error in main server file : '+err);
        process.exit(1)
    }
}

StartConnection();


//export for vercel
export default app;