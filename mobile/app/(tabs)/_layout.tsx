import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';


export default function TabsLayout() {
   
    const insets = useSafeAreaInsets();

    const {isSignedIn,isLoaded} = useAuth();

    if(!isLoaded){
        return null;
    }

    if(!isSignedIn){
        return <Redirect href="/(auth)"/>
    }

  return (
    <Tabs
    screenOptions={{
        headerShown:false,
        tabBarShowLabel:false,
        tabBarActiveTintColor:'#1DA1F2',
        tabBarInactiveTintColor:'#657786',
        tabBarStyle:{
           backgroundColor:'#fff',
           borderTopWidth:1,
           borderTopColor:'#E1E8ED',
           paddingBottom:10,
           height:50 + insets.bottom,
           paddingTop:5
        }
    }}
    >
        <Tabs.Screen
         name='index'
         options={{
           
            tabBarIcon:({color,size})=>{
              return <Feather name='home' color={color} size={size}/>
            }
        }}
        />

        <Tabs.Screen
         name='search'
         options={{
           
            tabBarIcon:({color,size})=>{
              return <Feather name='search' color={color} size={size}/>
            }
        }}
        />

        <Tabs.Screen
         name='notifications'
         options={{
            
            tabBarIcon:({color,size})=>{
              return <Feather name='bell' color={color} size={size}/>
            }
        }}
        />

        <Tabs.Screen
         name='message'
         options={{
            
            tabBarIcon:({color,size})=>{
              return <Feather name='mail' color={color} size={size}/>
            }
        }}
        />

        <Tabs.Screen
         name='profile'
         options={{
            tabBarIcon:({color,size})=>{
              return <Feather name='user' color={color} size={size}/>
            }
        }}
        />

    </Tabs>
  );
}
