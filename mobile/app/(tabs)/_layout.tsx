import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';


export default function TabsLayout() {
   
    const insets = useSafeAreaInsets();

    const {isSignedIn} = useAuth();

    if(!isSignedIn){
        return <Redirect href="/(auth)"/>
    }

  return (
    <Tabs
    screenOptions={{
        headerShown:false,
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
            tabBarShowLabel:false,
            tabBarIcon:({color,size})=>{
              return <Feather name='home' color={color} size={size}/>
            }
        }}
        />

        <Tabs.Screen
         name='search'
         options={{
            tabBarShowLabel:false,
            tabBarIcon:({color,size})=>{
              return <Feather name='search' color={color} size={size}/>
            }
        }}
        />

        <Tabs.Screen
         name='notifications'
         options={{
            tabBarShowLabel:false,
            tabBarIcon:({color,size})=>{
              return <Feather name='bell' color={color} size={size}/>
            }
        }}
        />

        <Tabs.Screen
         name='message'
         options={{
            tabBarShowLabel:false,
            tabBarIcon:({color,size})=>{
              return <Feather name='mail' color={color} size={size}/>
            }
        }}
        />

        <Tabs.Screen
         name='profile'
         options={{
            tabBarShowLabel:false,
            tabBarIcon:({color,size})=>{
              return <Feather name='user' color={color} size={size}/>
            }
        }}
        />

    </Tabs>
  );
}
