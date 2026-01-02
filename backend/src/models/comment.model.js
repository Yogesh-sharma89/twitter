import {Schema,model} from 'mongoose';

const commentSchema = new Schema({

    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    post:{
        type:Schema.Types.ObjectId,
        ref:'Post',
        required:true,
        index:true
    },
    content:{
        type:String,
        maxLength:200,
        required:true
    },
    reactionsCount: {
        like: { type: Number, default: 0 },
        love: { type: Number, default: 0 },
        haha: { type: Number, default: 0 },
        support: { type: Number, default: 0 },
        insightful: { type: Number, default: 0 },
    },
    totalReactions:{
        type:Number,
        default:0
    },
    dislikeCount:{
        type:Number,
        default:0,
    },
    parentCommentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
        index: true,
    },

    replyToUserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    replyDepth:{
        type:Number,
        default:0,
        max:5
    },
    repliesCount: {
        type: Number,
        default: 0,
    },

    isDeleted:{
        type:Boolean,
        default:false
    },
    deletedAt:{
        type:Date
    }


},{timestamps:true})


const Comment = model('Comment',commentSchema);

export default Comment;
