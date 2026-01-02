import { getAuth } from '@clerk/express';
import asyncHandler from 'express-async-handler';
import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import Comment from '../models/comment.model.js';
import Notification from '../models/notification.model.js';
import mongoose from 'mongoose';
import CommentInteraction from '../models/commentInteraction.model.js';

export const createComment = asyncHandler(async(req,res)=>{

    //mongodb session 

    const session = mongoose.startSession();

    (await session).startTransaction();

    const {postId} = req.params;

    const {userId} = getAuth(req);

    const {content} = req.body;



    if(content.length>1 || content.length<200 || content.trim()===''){
        (await session).abortTransaction();
        (await session).endSession();
        return res.status(400).json({message:'Invalid content length'})
    }

    const post = await Post.findById(postId);

    if(!post || post.isDeleted){
         (await session).abortTransaction();
        (await session).endSession();
        return res.status(404).json({message:"Post doesn't exists."})
    }

    const currentUser = await User.findOne({clerkId:userId},{},{session});

    if(! currentUser || currentUser.accountStatus==='deleted'){
         (await session).abortTransaction();
        (await session).endSession();
        return res.status(404).json({message:'User account not found.'})
    }

    //create comment 

    const newComment = await Comment.create({
        user:currentUser._id,
        post:post._id,
        content,
        likes:[],
        dislikes:[],
        parentCommentId:null
    },{session});

    await Post.findByIdAndUpdate(post._id,{$inc:{commentCount:1}},{session})

    const commentNotification = await Notification.create({
        from:currentUser._id,
        to:post.userId,
        type:'comment',
        post,
        comment:newComment._id,
    },{session})

    (await session).commitTransaction();

    return res.status(201).json({message:'Comment created successfully',comment:newComment,notification:commentNotification});

})

export const updateComment = asyncHandler(async(req,res)=>{

    const {commentId} = req.params;

    const {userId} = getAuth(req)

    const {content} = req.body;

    if(content.length<1 || content.length>200){
        return res.status(400).json({message:'Invalid comment length'})
    }

    const currentUser = await User.findOne({clerkId:userId})

    if(!currentUser || currentUser.accountStatus==='deleted'){
        return res.status(404).json({message:'User account not found.'})
    }

    const comment = await Comment.findById(commentId);

    if(!comment || comment.isDeleted){
        return res.status(404).json({message:'Comment not found.'})
    }

    if(!comment.user.equals(currentUser._id)){
        return res.status(403).json({message:'Not allowed to update this comment.'})
    }

    if(comment!==undefined) comment.content = content;

    await comment.save();

    return res.status(200).json({message:'Comment updated successfully'})
    
})

export const deleteComment = asyncHandler(async(req,res)=>{

    const session = mongoose.startSession();

    (await session).startTransaction();

    const {userId} = getAuth(req);

    const {commentId} = req.params;

    const currentUser = await User.findOne({clerkId:userId},{},{session});

    if(!currentUser || currentUser.accountStatus==='deleted'){
         (await session).abortTransaction();
        (await session).endSession();
        return res.status(404).json({message:"User account doesn't exists."})
    }

    const comment = await Comment.findById(commentId);

    if(!comment || comment.isDeleted){
         (await session).abortTransaction();
        (await session).endSession();
        return res.status(404).json({message:'This comment do not exists.'})
    }

    //only comment owner can delete it 

    if(!comment.user.equals(currentUser._id)){
         (await session).abortTransaction();
        (await session).endSession();
        return res.status(403).json({message:'You are not allowed to delete this comment.'})
    }

    //soft delete the comment 

    if(comment.isDeleted){
         (await session).abortTransaction();
        (await session).endSession();
       return res.status(400).json({message:'Comment is already deleted'})
    }

    comment.isDeleted  =true;
    comment.deletedAt = new Date();

    await comment.save({session});

    if(comment.parentCommentId){
        //then it is a reply of another commwnt decrease comment reply count only ;
        await Comment.findByIdAndUpdate(comment.parentCommentId,{$inc:{repliesCount:-1}},{session});
          (await session).commitTransaction();

        return res.status(200).json({message:'Comment deleted successfully'})
    }

    //now decrement comment count from post 

    await Post.findByIdAndUpdate(comment.post,{$inc:{commentCount:-1}},{session});

    (await session).commitTransaction();


    return res.status(200).json({message:'Comment deleted successfully'})
    
})

export const getCommentReplies = asyncHandler(async(req,res)=>{

    const {commentId} = req.params;

    if(!commentId){
        return res.status(400).json({message:'Parent comment is missing.'})
    }

    const {userId} = getAuth(req);

    const {cursor} = req.query;

    const limit = 20;

    const parentComment = await Comment.findById(commentId);

    if(!parentComment || parentComment.isDeleted){
        return res.status(404).json({message:'Comment not found.'})
    }

    const currentUser = await User.findOne({clerkId:userId});

    if(!currentUser){
        return res.status(404).json({message:'User not found.'})
    }

    const commentReplyQuery  = {parentCommentId:commentId,isDeleted:false};

    if(cursor){
        commentReplyQuery._id = {$lt:mongoose.Types.ObjectId(cursor)}
    }

    const replies = await Comment.find(commentReplyQuery).sort({_id:-1}).populate('user','username imageUrl').populate('replyToUserId','username imageUrl');

    const nextCursor = replies.length===limit ? replies[replies.length-1]._id : null;

    return res.status(200).json({message:'Comment replies fetch successfully',replies,cursor:nextCursor})
    
})

export const createCommentReply = asyncHandler(async(req,res)=>{

    const session = mongoose.startSession();

    (await session).startTransaction();

    const {userId} = getAuth(req);

    const {commentId} = req.params;

    const {content} = req.body;

    if(content.length<1 || content.length>200 || content.trim()===''){
        (await session).abortTransaction();
        (await session).endSession();
        return res.status(400).json({message:'Invalid content'})
    }

    //check parent comment exist or not

    const parentComment = await Comment.findById(commentId);

    if(!parentComment || parentComment.isDeleted){
         (await session).abortTransaction();
        (await session).endSession();
        return res.status(404).json({message:'Parent comment not found.'})
    }

    const currentUser = await User.findOne({clerkId:userId},{},{session});

    if(!currentUser || currentUser.accountStatus==='deleted'){
         (await session).abortTransaction();
        (await session).endSession();
        return res.status(404).json({message:'User not found.'})
    }
     
    const newReply = await Comment.create({
        user:currentUser._id,
        post:parentComment.post,
        content,
        parentCommentId:parentComment._id,
        replyToUserId:parentComment.user,
        replyDepth:1,
    },{session});

    //now increase parentcomment replies count;

   const updatedParentComment = await Comment.findByIdAndUpdate(commentId,{$inc:{repliesCount:1}},{new:true,runValidators:true,session});

   //send reply notification

   if(!currentUser._id.equals(parentComment.user)){
     await Notification.create({
        from:currentUser._id,
        to:parentComment.user,
        type:'comment_reply',
        post:parentComment.post,
        comment:parentComment._id,
        commentReply:newReply._id
     },{session})
   }

   (await session).commitTransaction();

   (await session).endSession();

   return res.status(201).json({message:"Reply created successfully",reply:newReply,parentComment:updatedParentComment})

})

//comment reaction and dislike 
export const commentInteraction = asyncHandler(async(req,res)=>{

    //satrt mongoDb transaction 
    const session = mongoose.startSession();
     (await session).startTransaction();

    const {userId}  = getAuth(req);

    const {commentId} = req.params;

    const { interactionType, reactionType, reason, customReason } = req.body;

    const currentUser = await User.findOne({clerkId:userId},{},{session});

    if(!currentUser || currentUser.accountStatus==='deleted'){
        (await session).abortTransaction();
        (await session).endSession();
        return res.status(404).json({messge:"User account not found"})
    }

    //check comment existance

    const comment = await Comment.findById(commentId,{},{session});

    if(!comment || comment.isDeleted){
        (await session).abortTransaction();
        (await session).endSession();
        return res.status(404).json({message:'Comment not found.'})
    }

    if(!comment.reactionsCount.hasOwnProperty(reactionType)){
        (await session).abortTransaction();
        (await session).endSession();
        return res.status(400).json({message:'Invalid reaction request.'})
    }

    //then comes interaction logic 
    const existingInteraction = await CommentInteraction.findOne({commentId:comment._id,userId:currentUser._id},{},{session});

    let oldReaction = existingInteraction.reaction;

    if(!existingInteraction){
        //create interaction

        const newInteraction = await CommentInteraction.create({
            commentId:comment._id,
            userId:currentUser._id,
            type:interactionType,
            reaction:interactionType==='reaction' ? reactionType : null,
            reason:interactionType==='dislike' ? reason : null,
            customReason: (interactionType==='dislike' && reason==='other') ? customReason : ''
        },{session})

        //send notification 

        if(!currentUser._id.equals(comment.user)){
            await Notification.create({
                from:currentUser._id,
                to:comment.user,
                type:'reaction',
                reaction:reactionType,
                post:comment.post,
                comment:comment._id
            })
        }

        if(interactionType==='reaction'){
            comment.reactionsCount[reactionType]+=1;
            comment.totalReactions+=1;
        }else{
            comment.dislikeCount+=1;
        }
        
        await comment.save({session})
        (await session).commitTransaction();

        return res.status(200).json({message:'Comment Interaction added succesfully',interaction:newInteraction,comment,})

    }

    else if(existingInteraction.type===interactionType){

        if(interactionType==='reaction'){
            if(existingInteraction.reaction===reactionType){
                //then same reaction click reaction remove
                await CommentInteraction.findByIdAndDelete(existingInteraction._id,{session});

                //the update reaction count on that comment
                comment.reactionsCount[reactionType]-=1;
                comment.totalReactions-=1;

            }else{

                


                //means reaction is different 

                existingInteraction.reaction = reactionType;

                //then update comment counts 
                comment.reactionsCount[oldReaction]-=1;
                comment.reactionsCount[reactionType]+=1;

            }

            await existingInteraction.save({session});
            await comment.save({session});
            (await session).commitTransaction();

            return res.status(200).json({message:'Reaction updated successfully'})
            
        }
        else{
            //then it dislike reaction and remove it

            await CommentInteraction.findByIdAndDelete(existingInteraction._id,{session});

            comment.dislikeCount-=1;
            await comment.save({session});

            (await session).commitTransaction();

            return res.status(200).json({message:'Dislike removed successfully'});
        }
    }

    else{


        if(existingInteraction.type==='reaction' && interactionType==='dislike'){
            //then remove reaction and add dislike 

            existingInteraction.reaction = null;
            existingInteraction.type = 'dislike',
            existingInteraction.reason = reason;
            existingInteraction.customReason = reason==='other' ? customReason : ''

            //upadate comment 
            comment.reactionsCount[oldReaction]-=1;
            comment.totalReactions-=1;
            comment.dislikeCount+=1;
        }else{
            //now remove dislike and add reaction;

            existingInteraction.reaction = reactionType,
            existingInteraction.type = 'reaction',
            existingInteraction.reason=null;
            existingInteraction.customReason='',

            // update comment 
            comment.reactionsCount[reactionType]+=1;
            comment.totalReactions+=1;
            comment.dislikeCount-=1;
        }

        await existingInteraction.save({session});
        await comment.save({session});
        (await session).commitTransaction();

        return res.status(200).json({message:'Reaction changed successfully.'})
    }
})
