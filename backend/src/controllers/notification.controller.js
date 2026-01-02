import { getAuth } from '@clerk/express';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import mongoose from 'mongoose';

export const getAllNotifications = asyncHandler(async(req,res)=>{
    

    const limit = 20;

    const {cursor} = req.query;

    const currentUser = req.user;

    const query = {to:currentUser._id}

    if(cursor){
        if(!mongoose.Types.ObjectId.isValid(cursor)){
            return res.status(400).json({message:'Invalid cursor parameter'});
        }
        query._id={$lt:new mongoose.Types.ObjectId(cursor)}
    }

    const notifications = await Notification.find(query).sort({_id:-1}).limit(limit).populate('from','username firstname lastname imageUrl')
    .populate('post','content media totalReactions')
    .populate('comment','content');

    const nextCursor = notifications.length===limit ? notifications[notifications.length-1]._id : null;

    return res.status(200).json({message:'Notifications fetch successfully',notifications,cursor:nextCursor});

})

export const deleteNotification = asyncHandler(async(req,res)=>{

    //delete the notification 

     const notification = req.notification;

    await Notification.findByIdAndDelete(notification._id);

    return res.status(200).json({message:'Notification deleted successfully'});
})

export const markReadNotification = asyncHandler(async(req,res)=>{

    //user
    const notification = req.notification;

    if(!notification.isRead){
        notification.isRead = true,
        notification.readAt = new Date();
        await notification.save();
    }

    return res.status(200).json({message:'Notification marked as read'})


})

export const getUnreadNotificationCount = asyncHandler(async(req,res)=>{

    const currentUser = req.user;

    const unreadCount = await Notification.countDocuments({to:currentUser._id,isRead:false});

  return res.status(200).json({message:'Unread count fetch successfully',count:unreadCount});
})