import { useAuth, useClerk } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import React from 'react';
import {Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {

    const {signOut} = useClerk();

  return (
    <SafeAreaView className='px-6'>
      <Text>Hello home screen</Text>
      <TouchableOpacity className=' mt-4 border border-gray-600 rounded-full py-3 px-6 ' onPress={()=>signOut()}>
         <Text className='text-center font-medium'>Sign out</Text>
      </TouchableOpacity>
     </SafeAreaView>
  );
}
