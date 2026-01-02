import { useSignOut } from '@/hooks/useSignOut';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';


export default function SignOutButton() {

    const {handleSignOut} = useSignOut();

  return (
    <TouchableOpacity
    accessibilityLabel='Log out'
    accessibilityRole='button'
    onPress={handleSignOut}>
        <Feather name='log-out' size={25} color={'#E0245E'}/>
    </TouchableOpacity>
  );
}
