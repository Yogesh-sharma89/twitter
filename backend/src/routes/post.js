import {Router} from 'express';
import { protectedRoute } from '../middleware/auth.js';
import { createPost, deletePost, getAllPosts, getPost, getUserPosts, likePost, updatePost } from '../controllers/post.controller.js';
import upload from '../middleware/upload.js';
import handleMulterError from '../middleware/multerError.js';

const router = Router();

router.use(protectedRoute);

router.get('/',getAllPosts);

router.get('/:postId',getPost);
//for particular post we have to fetch all comments also for that pos

router.get('/user/:username/posts',getUserPosts);

router.post('/',(req,res,next)=>{

    upload.array('media',5)(req,res,function(err){
        if(err){
            return handleMulterError(res,err);
        }

        next();
    })
}
    ,createPost);

router.put('/:postId',updatePost);

router.delete('/:postId',deletePost);

router.patch('/:postId/like',likePost);

export default router;