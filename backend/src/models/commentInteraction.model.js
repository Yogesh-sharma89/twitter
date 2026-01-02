import { Schema,model } from "mongoose";

const commentInteractionSchema = new Schema({
    commentId:{
        type:Schema.Types.ObjectId,
        ref:'Comment',
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    type:{
        type:String,
        enum:['reaction','dislike'],
        default:null
    },
    reaction:{
        type:String,
        enum:['like','love','haha','support','insightful'],
        default:null
    },
    reason:{
        
            type:String,
            enum:[
                "not_relevant",
                "misleading",
                "offensive",
                "spam",
                "disagree",
                "other"
            ],
    },
    customReason:{
        type:String,
        maxLength:200,
        default:''
    },
},{timestamps:true});

commentInteractionSchema.index(
  { postId: 1, userId: 1 },
  { unique: true }
);

commentInteractionSchema.pre('validate',function(next){

    //check if type reaction and agar reaction pye nhi hai toh reaction nhi banega 

    if(this.type==='reaction'){

        if(!this.reaction){
           return  next(new Error('Reaction type is required'))
        }

        this.reason = undefined;
        this.customReason = undefined;

        
    }

    if(this.type==='dislike'){
        if(!this.reason){
            return next(new Error('Dislike reason is required'))
        }

        if(this.reason==='other' && !this.customReason){
            return next(new Error('Other reason is required'))
        }
    }

    next();
})


const CommentInteraction = model('CommentInteraction',commentInteractionSchema);



export default CommentInteraction;