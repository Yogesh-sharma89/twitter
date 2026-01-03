import React, {  useState } from "react";
import { View, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Category from "@/components/category";
import TopicWiseCategory from "@/components/topicWiseCategory";
import { TRENDING_TOPICS } from "@/constants/topic-wise-category";
import { Asset } from "expo-asset";
import ConfettiCannon from "react-native-confetti-cannon";
import {useAudioPlayer} from 'expo-audio';

import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");


const celebrateSound = Asset.fromModule(
  require('../../assets/sounds/wow.mp3')
)

export default function SearchScreen() {

  const [category, setCategory] = useState<string>("all");

  const player = useAudioPlayer(celebrateSound)

  const topic_wise_category =
    category === "all"
      ? TRENDING_TOPICS
      : TRENDING_TOPICS.filter((item) => item.category === category);

  const categoryTitle =
    category === "all" || category === "trending"
      ? "Trending Topics"
      : category === "for_you"
      ? "Trending for you"
      : `Trending in ${category}`;

  const [celebratekey, setCelebrateKey] = useState(0);


  const handleCelebrate =async() => {

    setCelebrateKey((prev)=>prev+1);

    requestAnimationFrame(()=>{
      player.seekTo(0);
      player.play();
    })
  };

  

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* header search  */}

      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row rounded-full gap-4 items-center py-1.5 px-5 bg-gray-100">
          <Feather name="search" size={23} color={"#657786"} />
          <TextInput
            placeholder="Search Twitter"
            className="flex-1 text-lg leading-6 text-balance"
            placeholderTextColor={"#657786"}
            autoCapitalize="words"
            autoCorrect={true}
            autoFocus={true}
          />
        </View>
      </View>

      <View>
        <Category category={category} setCategory={setCategory} />
      </View>

      <View className="flex-1">
        <TopicWiseCategory
          data={[...topic_wise_category]}
          title={categoryTitle}
          handleCelebrate={handleCelebrate}
        />
      </View>

      {
        celebratekey>0 && 
        <>
          <ConfettiCannon
            key={`center-${celebratekey}`}
            count={150}
            origin={{ x: width / 2, y: -20 }}
            fallSpeed={2800}
            explosionSpeed={400}
            fadeOut
            colors={[
              "#ff4d6d", // pink
              "#ffd166", // yellow
              "#4cc9f0", // blue
              "#cdb4db", // purple
              "#b7e4c7", // mint
            ]}
          />

            {/* 🎉 Left blast */}
          <ConfettiCannon
              key={`left-${celebratekey}`}
              count={80}
              origin={{ x: 0, y: height / 3 }}
              explosionSpeed={600}
              fallSpeed={3200}
              fadeOut
              colors={["#ff758f", "#ffd6a5", "#9bf6ff"]}
          />


          <ConfettiCannon
            key={`right-${celebratekey}`}
            count={80}
            origin={{ x: width, y: height / 3 }}
            explosionSpeed={600}
            fallSpeed={3200}
            fadeOut
            colors={["#f72585", "#ffd166", "#90dbf4"]}
          />

        </>
      }
    </SafeAreaView>
  );
}
