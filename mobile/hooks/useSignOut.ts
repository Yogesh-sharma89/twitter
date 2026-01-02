import { useAuth } from "@clerk/clerk-expo"
import { Alert } from "react-native";

export const useSignOut = ()=>{
    const {signOut}  = useAuth();

    const handleSignOut = ()=>{
        Alert.alert('Logout','Are you sure you want to logged out.',[
            {text:'Cancel',style:'cancel'},

            {
                text:'Logout',
                style:'destructive',
                onPress:async()=>{
                    try{
                     await signOut();
                    }catch(err){
                        console.log('Error in sign out hook : '+err);
                      Alert.alert('Error','Failed to sign out. Please try again')
                    }
                }
            }
        ])
    }

    return {handleSignOut};
}