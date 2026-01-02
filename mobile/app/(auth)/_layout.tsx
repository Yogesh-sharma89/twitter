import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { ActivityIndicator, View } from 'react-native'

export default function AuthRoutesLayout() {
  const { isSignedIn,isLoaded} = useAuth()

   if(!isLoaded){
          return (
              <View className='flex-1 items-center justify-center'>
                  <ActivityIndicator size={'large'} color={'#000'}/>
              </View>
          )
    }

  if (isSignedIn) {
    return <Redirect href={'/'} />
  }

  return <Stack screenOptions={{headerShown:false}}/>
}