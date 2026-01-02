import { getAuth, requireAuth } from "@clerk/express";

export const protectedRoute = [
    requireAuth(),

    async (req,res,next)=>{
        const {userId} = getAuth(req);

        if(!userId){
            return res.status(401).json({message:'Unauthorized token '})
        }


       next();

    }
]