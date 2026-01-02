import { aj } from "../config/arcjet.js";

//arcject middleware foe rate limiting , bot detection , security purpose

 const ArcjetMiddleware = async (req,res,next)=>{
    try{

        const decision = await aj.protect(req,{
            requested:1 
        })

        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                return res.status(429).json({error:'To many requests.',message:'Rate limit exceeded. Please try again later.'})
            }
            else if(decision.reason.isBot()){
                return res.status(403).json({
                    error:'Bot access denied',
                    message:'Automation requests are not allowed'
                })
            }
            return res.status(403).json({
                error:'Forbidden',
                message:'Access denied for security reasons.'
            })
        }

        if(decision.results.some((result)=>result.reason.isBot() && result.reason.isSpoofed())){
            return res.status(403).json({
                error:'Spoofed bot detected',
                message:'Malicious bot activity detected'
            })
        }
        next();

    }catch(err){
        console.log('Arcjet middleware error : '+err);
        next(err);

    }
}

export default ArcjetMiddleware;