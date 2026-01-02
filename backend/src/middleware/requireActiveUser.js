import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";

export const requireActiveUser = async(req,res,next)=>{

    try{

    
     const {userId} = getAuth(req);

     
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findOne({ clerkId: userId });

        if (!user || user.accountStatus === "deleted") {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user; // 🔥 attach to req
        next();

    }catch(err){
        console.log('Error in require active user middleware : '+err);
        return res.status(500).json({message:'Interna; server error'})
    }
}