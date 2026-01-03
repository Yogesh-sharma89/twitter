import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';


interface TrendingTopic{
  id:string,
  topic:string,
  tweets:string,
  category:string
}

type trendListProps = {
  data:TrendingTopic[],
  title:string,
  handleCelebrate:()=>Promise<void>
}

export default function TopicWiseCategory({data,title,handleCelebrate}:trendListProps) {
  return (
    <FlatList
    data={data}
    keyExtractor={(item)=>item.id}
    contentContainerStyle={{
        paddingHorizontal:12,
        paddingVertical:10
    }}
    ListHeaderComponent={
      <Text className='text-xl font-bold text-gray-900 mb-6'>{title}</Text>
    }
    renderItem={({item})=>(
        <TouchableOpacity className='py-4 border-b border-gray-100'>

          <Text className='font-bold text-gray-900 text-xl'>{item.topic}</Text>

          <Text className='text-lg text-gray-500'>{item.tweets}</Text>
          
        </TouchableOpacity>
    )}
    ListFooterComponent={
     ( data.length>10 ?
      <TouchableOpacity className='mt-10 mb-4 w-full '
      onPress={async()=>await handleCelebrate()}
      >
        <Text className='text-center text-xl'>Topics end here ❤️ - Tap to celebrate 🎉</Text>
      </TouchableOpacity>
      : null
     )
    }
    />
  );
}
