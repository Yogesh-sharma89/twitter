import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";

export const useAuthGuard = ()=>{
    const {isLoaded,isSignedIn} = useAuth();

    if(!isLoaded){
       return null;
    }

    if(!isSignedIn){
        router.replace('/(auth)')
    }

    if(isSignedIn){
        router.replace('/(tabs)')
    }
}