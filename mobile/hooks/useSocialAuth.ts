import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react"
import { Alert } from "react-native";

export const useSocialAuth =  ()=>{

    const [isLoading,setIsLoading] = useState({google:false,apple:false});
    const {startSSOFlow} = useSSO();

    const handleSocialAuth  = async (strategy : 'oauth_google' | 'oauth_apple')=>{

         const provider = strategy==='oauth_google'? 'google':'apple';

        setIsLoading((prev)=>(
           {...prev,[provider]:true}
        ));

        try{

            const {createdSessionId,setActive} = await startSSOFlow({strategy});
             
            if(createdSessionId && setActive){
                setActive({session:createdSessionId})
            }


        }catch(err){
            console.log('Error in social auth hook : '+err);
           
            Alert.alert('Error',`Failed to sign in with ${provider}. Please try again`)

        }finally{
            setIsLoading((prev)=>(
           {...prev,[provider]:false}
        ));
        }
    }

    return {isLoading,handleSocialAuth};
}