import {Schema,model} from 'mongoose';

const followSchema = new Schema ({
    followerId:{
        type:Schema.Types.ObjectId,
        required:true,
        index:true,
        unique:true,
        ref:'User'
    },
    followingId:{
        type:Schema.Types.ObjectId,
        required:true,
        index:true,
        unique:true,
        ref:'User'
    }
},{timestamps:true})


followSchema.index(
  { followerId: 1, followingId: 1 },
  { unique: true }
);




followSchema.pre('validate',function(next){
    if(this.followerId && this.followingId && this.followerId.equals(this.followingId)){
        return next(new Error("You can't follow yourself"))
    }
    next();
})

const Follow = model('Follow',followSchema);

export default Follow;