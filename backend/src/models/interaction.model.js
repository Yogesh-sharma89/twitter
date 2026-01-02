import {Schema,model} from 'mongoose';

const interactionSchema = new Schema({
    postId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'Post',
        index:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'User',
        index:true
    },
    type:{
        type:String,
        enum:['reaction','dislike'],
        required:true,
    },
    reaction:{
       
            type:String,
            enum:[
                "like", "love", "celebrate", "support", "insightful", "haha","fire","sad"
            ],
            default:'like'
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
},{timestamps:true})

interactionSchema.index(
  { postId: 1, userId: 1 },
  { unique: true }
);

interactionSchema.pre('validate',function(next){

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

const Interaction = model('Interaction',interactionSchema);

export default Interaction;