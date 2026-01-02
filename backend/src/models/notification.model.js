import {Schema,model} from 'mongoose';

const notificationSchema = new Schema({

    from:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    to:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    type:{
        type:String,
        enum:['follow','reaction','comment','dislike','comment_reply'],
        required:true
    },
    reaction:{
        type:String,
        default:null
    },

    post:{
        type:Schema.Types.ObjectId,
        ref:'Post',
        default:null
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:'Comment',
        default:null
    },
    isRead:{
        type:Boolean,
        default:false,
    },
    readAt:{
        type:Date,
    }

},{timestamps:true})


notificationSchema.pre('validate',function (next){
    if(this.from && this.to && this.from.equals(this.to)){
        return next(new Error("You can't notify yourself"))
    }

    if(this.type==='follow' && (this.post || this.comment)){
        return next(new Error('Follow notification should not have post/comments'))
    }

    if(this.type==='like' && !this.post){
        return next(new Error('Like notification must have a post'))
    }

    if(this.type==='comment' && (!this.post || !this.comment)){
        return next(new Error('Comment notification must have a post and a comment'))
    }

    next();
})


const Notification = model('Notification',notificationSchema);

export default Notification;