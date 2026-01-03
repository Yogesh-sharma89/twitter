import { Stack } from "expo-router";
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'

import "../global.css"
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {

   

  return (
    <SafeAreaProvider>
    
    <ClerkProvider tokenCache={tokenCache}>
      <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name="(auth)" options={{headerShown:false}}/>
        <Stack.Screen name="(tabs)" options={{headerShown:false}}/>
      </Stack>
    </ClerkProvider>
   
    </SafeAreaProvider>
  )
}
