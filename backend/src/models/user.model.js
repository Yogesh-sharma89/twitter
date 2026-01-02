import {Schema,model} from 'mongoose'

const userSchema = new Schema({

    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
    
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        index:true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
     clerkId:{
        type:String,
        required:true,
        unique:true
     },
     imageUrl:{
        type:String,
        required:true,
        default:''
     },
     postCount:{
      type:Number,
      default:0,
      min:0
     },
     username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        match: [/^[a-zA-Z0-9_]+$/, 'Username can contain only letters, numbers, _']
     },
     bannerImage:{
        type:String,
        default:''
     },
     bio:{
        type:String,
        default:'',
        maxLength:200,
        validate:{
         validator:function (value){
            return value.length<200
         },
         message:'Bio cannot exceed 200 characters'
        }
     },
     location:{
        type:String,
        default:''
     },
     followers:{
      type:Number,
      default:0,
      min:0
     },
     following:{
      type:Number,
      default:0,
      min:0
     },
     accountStatus:{
      type:String,
      enum:['active','deleted'],
      default:'active'
     },

     privacy:{
      type:String,
      enum:['public','private'],
      default:'public'
     }
     ,
     deletedAt:{
      type:Date,
     }

},{timestamps:true})

const User = model('User',userSchema);

export default User;