import { Router } from "express";
import { protectedRoute } from "../middleware/auth.js";
import { commentInteraction, createComment, deleteComment, getCommentReplies, updateComment } from "../controllers/comment.controller.js";

const commentRoutes = Router();

commentRoutes.use(protectedRoute);

//create comment 
commentRoutes.post('/post/:postId',createComment);

//update comment 
commentRoutes.patch('/:commentId',updateComment);

//delete comment 
commentRoutes.delete('/:commentId',deleteComment)

//get nested comments reply 
commentRoutes.get('/:commentId/replies',getCommentReplies);

commentRoutes.post('/:commentId/interact',commentInteraction)

export default commentRoutes;