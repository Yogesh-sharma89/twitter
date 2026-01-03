import { CATEGORIES } from '@/constants/categories';
import React from 'react';
import { FlatList, Pressable, Text } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

interface CategoryProps{
  category:string,
  setCategory:(category:string)=>void
}

export default function Category({category,setCategory}:CategoryProps) {
 
    

  return (

   <FlatList
   data={CATEGORIES}
   keyExtractor={(item)=>item.id}
    horizontal={true}
   showsHorizontalScrollIndicator={false}
   contentContainerStyle={{
    paddingHorizontal:18,
    paddingVertical:18
   }}
   renderItem={({item})=>{

    const isActive = item.id === category ;

     return <Pressable 
            className={`px-4 py-2 flex items-center flex-row gap-2  rounded-2xl mr-5 
                ${isActive ? 'bg-blue-400' : 'bg-stone-200'}
                `}
            onPress={()=>setCategory(item.id)}
            >
                <Ionicons name={item.icon} size={16} color={isActive ? '#fff':'#000'}/>

                <Text 
                 className={`text-center font-medium text-xl ${isActive ? 'text-white' : 'text-black'}`}
                >
                  {item.label}
                </Text>
            </Pressable>
   }}
   />
  );
}
