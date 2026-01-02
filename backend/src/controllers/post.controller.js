import asyncHandler from "express-async-handler"
import Post from "../models/post.model.js"
import mongoose from "mongoose";
import { getAuth } from "@clerk/express";
import User from '../models/user.model.js';
import Follow from '../models/follow.model.js'
import cloudinary, { uploadToCloudinary } from "../config/cloudinary.js";
import fs from 'fs/promises';
import Interaction from "../models/interaction.model.js";
import Notification from "../models/notification.model.js";
import Comment from '../models/comment.model.js';

export const getAllPosts = asyncHandler(async (req, res) => {

    const limit = 20
    const { cursor } = req.query;

    //curso is last post _id for next older 20 post than previous post 

    const query = { visibility: "public", isDeleted: false }


    if (cursor) {
        query._id = { $lt: new mongoose.Types.ObjectId(cursor)}
    }

    const posts = await Post.aggregate([
        {
            $match: query
        },
        { $sort: { _id: -1 } },

        { $limit: limit }
        ,
        //join user as author 

        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'author'
            }
        },
        { $unwind: '$author' },

        //join last 2 comments 

        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'post',
                pipeline: [
                    { $sort: { createdAt: -1 } },
                    { $limit: 2 },

                    {
                        $lookup: {
                            from: 'users',
                            localField: 'user',
                            foreignField: '_id',
                            as: 'author'
                        }
                    },
                    { $unwind: '$author' },

                ],
                as: 'recentComments'
            }
        }

    ])


    const nextCursor = posts.length === limit ? posts[posts.length - 1]._id : null;


    return res.status(200).json({ message: 'Feed fetch successfully', posts, cursor: nextCursor });

})

export const getPost = asyncHandler(async (req, res) => {

    const { postId } = req.params;

    const { userId } = getAuth(req);

    const {cursor} = req.query;

    const limit = 20;
    

    const post = await Post.findById(postId).populate('userId', 'username firstname lastname  imageUrl');

    if (!post || post.isDeleted) {
        return res.status(404).json({ message: 'Post not found' })
    }

    const viewer = await User.findOne({ clerkId: userId });

    if (!viewer) {
        return res.status(404).json({ message: 'User not found' })
    }

    const isOwner  = post.userId.equals(viewer._id);

    if(!isOwner){

        if(post.visibility==='followers'){

            const isFollowing = await Follow.exists({
            followerId: viewer._id,
            followingId: post.userId
           })

            if (!isFollowing) {
                return res.status(403).json({ message: 'Only followers can see this post' })
            }

        }

         if (post.visibility === 'private') {
        //check if user exist in allowed user or not 

                const isUserAllowed = post.allowedUsers.includes(viewer._id);

                if (!isUserAllowed) {
                    return res.status(403).json({ message: 'This post is private . Only owner and allowed users can see this' });
                }
        }


    }

    const commentsQuery  = {post:post._id,parentCommentId:null}


    if(cursor){
        commentsQuery._id={$lt:mongoose.Types.ObjectId(cursor)}
    }

    //fetch  top level comment for that users also 

    const comments = await Comment.find(commentsQuery).sort({_id:-1}).limit(limit).lean().populate('user','username imageUrl')
    const nextCursor = comments.length === limit ? comments[comments.length-1] : null;

    return res.status(200).json({post,comments,cursor:nextCursor});

})

export const getUserPosts = asyncHandler(async (req, res) => {

    const { username } = req.params;

    const limit = 20;

    const { cursor } = req.query;

    const postOwner = await User.findOne({ username });

    if (!postOwner || postOwner.accountStatus !== 'active') {
        return res.status(404).json({ message: `User with ${username} not found` })
    }

    const { userId: clerkId } = getAuth(req);

    const currentUser = await User.findOne({ clerkId }).lean();

    const query = { userId: postOwner._id, isDeleted: false };

    if (cursor) {
        query._id = { $lt: new mongoose.Types.ObjectId(cursor) }
    }

    let nextCursor = null;

    //if owner is current user 

    if (!currentUser._id.equals(postOwner._id)) {
        if (postOwner.privacy === 'public') {
            query.visibility = 'public'
        }

        else {

            const isFollower = await Follow.exists({
                followerId: currentUser._id,
                followingId: postOwner._id
            })

            if (!isFollower) {
                return res.status(400).json({ message: 'This account is private. Follow to see posts' });
            }

            query.$or = [
                { visibility: 'public' },
                { visibility: 'followers' },
                { visibility: 'private', allowedUsers: { $in: [currentUser._id] } }
            ]
        }
    }

    const posts = await Post.find(query).sort({ _id: -1 }).limit(limit).lean();

    nextCursor = posts.length === limit ? posts[posts.length - 1]._id : null;

    return res.status(200).json({ posts, cursor: nextCursor });


})

export const createPost = asyncHandler(async (req, res) => {

    const { userId: clerkId } = getAuth(req);

    const { content, visibility, allowedUsers } = req.body;

    if (!content && (!req.files || req.files.length === 0)) {
        return res.status(400).json({ message: 'Post must have either content or media ' });
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
        return res.status(404).json({ message: 'User not found ! ' });
    }

    //create media 

    const media = await Promise.all(
        (req.files || []).map(async (file) => {
            const result = await uploadToCloudinary(file.path, file.mimetype);

            await fs.unlink(file.path);

            return result;
        })

    )

    //now create post 

    const post = await Post.create({
        userId: user._id,
        content,
        media,
        visibility,
        allowedUsers: visibility === 'private' ? allowedUsers : []
    });

    return res.status(201).json({ message: 'Post created successfully', post });


})

export const updatePost = asyncHandler(async (req, res) => {

   const {userId} = getAuth(req);

   const {postId} = req.params;

   const {content,visibility} = req.body;

   const currentUser = await User.findOne({clerkId:userId});

   if(!currentUser || currentUser.accountStatus==='deleted'){
    return res.status(404).json({message:'User not found'})
   }

   const post = await Post.findById(postId);

   if(!post || post.isDeleted){
    return res.status(404).json({message:'Post not found.'})
   }

   if(!post.userId.equals(currentUser._id)){
    return res.status(403).json({message:'You are not allowed to update this post'})
   }

   let newMedia = null

   if(req.files && req.files.length>0){
     //then only remove old files and upload new files 

     for ( const file of post.media){
        await cloudinary.uploader.destroy(file.publicId);
     }

     //now upload 

       newMedia = await Promise.all(
        (req.files || []).map(async (file) => {
            const result = await uploadToCloudinary(file.path, file.mimetype);

            await fs.unlink(file.path);

            return result;
        })

       )
   }

   if(content!==undefined) post.content='';

   post.media = newMedia;
   post.visibility = visibility;

   await post.save();

   return res.status(200).json({message:'Post updated successfully',post});

})

export const deletePost = asyncHandler(async (req, res) => {

    const { userId } = getAuth(req);

    const { postId } = req.params;

    let user = null;

    if (userId) {
        user = await User.findOne({ clerkId: userId });
    }

    const post = await Post.findById(postId);

    if (!post) {
        return res.status(404).json({ message: 'Post not found.' })
    }

    //check ownership 
    if (!post.userId.equals(user._id)) {
        return res.status(403).json({ message: 'You are not allowed to delete this post' })
    }

    //check if this post is already delete or not 

    if (post.isDeleted) {
        return res.status(409).json({ message: 'This post is already deleted.' })
    }

    //now delete this post 

    post.isDeleted = true;
    post.deletedAt = new Date();

    await post.save();

    return res.status(200).json({ message: 'Post deleted successfully' })


})

export const likePost = asyncHandler(async (req, res) => {

    //mongodb transaction

    const session = await mongoose.startSession();

    session.startTransaction();

    const { postId } = req.params;

    const { userId } = getAuth(req);

    const { interactionType, reactionType, reason, customReason } = req.body;

    const post = await Post.findById(postId);

    const data = {
        interactionType, reactionType, reason, customReason
    };

    if (!post || post.isDeleted) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "This post doesn't exist or deleted post" })
    }

    const currentUser = await User.findOne({ clerkId: userId });

    if (!currentUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'User not found.' })
    }


    //if reaction is valid 
    if (!post.reactionsCount.hasOwnProperty(reactionType)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Invalid reaction request' })
    }

    //if user is owner he can like his post anyone(if already likes then dislikes it) 

    const isOwner = currentUser._id.equals(post.userId);

    if (!isOwner) {

        if (post.visibility === 'followers') {

            const isFollower = await Follow.exists({
                followerId: currentUser._id,
                followingId: post.userId
            })

            if (!isFollower) {
                await session.abortTransaction();
                session.endSession();
                return res.status(403).json({ message: 'You are not allowed to react on this post' })
            }
        }

        if (post.visibility === 'private') {
            //check if user is a allowed user ;

            const isUserAllowed = post.allowedUsers.includes(currentUser._id);

            if (!isUserAllowed) {
                 await session.abortTransaction();
                session.endSession();
                return res.status(403).json({ message: 'Not authorized to interect with this post as it is private post' })
            }
        }
    }

    //interaction logic


    //check interaction exist for this user or not 


    const existingInteraction = await Interaction.findOne({ postId: post._id, userId: currentUser._id }, {}, { session });

    if (!existingInteraction) {
        //create interaction
        const newInteraction = await Interaction.create({
            postId: post._id,
            userId: currentUser._id,
            type: interactionType,
            reaction: interactionType === 'reaction' ? reactionType : null,
            reason: interactionType === 'dislike' ? reason : null,
            customReason: interactionType === 'dislike' && reason === 'other' ? customReason : ''
        }, { session })

        //send notification

        if(!currentUser._id.equals(post.userId)){

            await Notification.create({
            from:currentUser._id,
            to:post.userId,
            type:interactionType,
            reaction:interactionType==='reaction' ? reactionType : null , 
            post:post._id
        },{session})
        }

        //increase post like or dislike count
        if (interactionType === 'reaction') {
            post.reactionsCount[reactionType] += 1;
            post.totalReactions += 1;
        } else {
            post.dislikeCount += 1;
        }

         await post.save({ session });

        await session.commitTransaction();

        return res.status(200).json({ message: 'New Interaction created successfully ', interaction: newInteraction });
    }

    else if (existingInteraction.type === interactionType) {

        if (interactionType === 'reaction') {
            if (existingInteraction.reaction === reactionType) {
                //then delete that interaction
                await Interaction.findByIdAndDelete(existingInteraction._id, { session });

                post.reactionsCount[reactionType] -= 1;
                post.totalReactions -= 1;
                await post.save({ session });

                await session.commitTransaction();

                return res.status(200).json({ message: 'Reaction deleted successfully' });

            } else {
                //update the reaction 
                let oldReaction = existingInteraction.reaction;

                await Interaction.findByIdAndUpdate(existingInteraction._id, { reaction: reactionType }, { session })

                post.reactionsCount[oldReaction] -= 1;
                post.reactionsCount[reactionType]+=1;
                await post.save({ session })

                await session.commitTransaction();

                return res.status(200).json({ message: 'Reaction updated successfully' })
            }
        }
        else {
            //now delete the dislike interaction 

            await Interaction.findByIdAndDelete(existingInteraction._id, { session });

            post.dislikeCount -= 1;
            await post.save({ session })

            await session.commitTransaction();

            return res.status(200).json({ message: 'Dislike removed successfully' });
        }

    }

    else {
        //toggle the ineteraction

        if (existingInteraction.type === 'reaction' && interactionType === 'dislike') {
            //add dislike and remove reaction

            let oldReaction = existingInteraction.reaction;

            existingInteraction.reaction = null;
            existingInteraction.reason = reason || null,
            existingInteraction.customReason = customReason || ''

            await existingInteraction.save({ session });

            //now update post reaction and dislike count ;

            post.reactionsCount[oldReaction] -= 1;
            post.dislikeCount += 1;
            post.totalReactions -= 1;

            await post.save({ session })

            await session.commitTransaction();

            return res.status(200).json({ message: 'Reaction removed and dislike add for this post' })


        } else {

            existingInteraction.reason = null;
            existingInteraction.customReason = '';
            existingInteraction.reaction = reactionType;

            await existingInteraction.save({ session });

            post.reactionsCount[reactionType] += 1;
            post.totalReactions += 1;
            post.dislikeCount -= 1;

            await post.save({session});

            await session.commitTransaction();

            return res.status(200).json({ message: 'Dislike removed and reaction added to this post.' })

        }

    }

})
