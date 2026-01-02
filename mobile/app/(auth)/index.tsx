import { useSocialAuth } from "@/hooks/useSocialAuth";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
 
  const {isLoading,handleSocialAuth} = useSocialAuth();

  return (
    <View className="flex-1 bg-white">

       <View className="flex-1 p-8 justify-between">
          <View className="flex-1 justify-center">
              <View className="items-center">

                {/* demo image  */}

                <Image
                 source={require('../../assets/images/auth2.png')}
                 alt="Auth Image"
                 className="size-[30rem]"
                 resizeMode="contain"
                />

              </View>

              <View className="gap-3 mt-3">

                <TouchableOpacity className="flex-row bg-white border border-gray-300 rounded-full justify-center  py-3 px-6"
                 onPress={()=>handleSocialAuth('oauth_google')}
                 style={{
                  shadowColor:'#000',
                  shadowOffset:{width:0,height:0},
                  shadowOpacity:0.4,
                  shadowRadius:2,
                  elevation:0.2
                 }}  
                 disabled={isLoading.google}
                >
                    {
                      isLoading.google ? (
                        <ActivityIndicator size={'small'} color='#000'/>
                      )
                      : 
                      (
                        <View className="flex-row items-center justify-center gap-3">

                           <Image
                              source={require('../../assets/images/google.png')}
                              alt="Google logo"
                              className="size-12"
                              resizeMode="contain"
                            />

                            <Text className="font-medium text-xl">
                              Continue with Google
                            </Text>

                        </View>
                      )
                    }

                </TouchableOpacity>

                <TouchableOpacity className="flex-row bg-white border border-gray-300 rounded-full justify-center  py-4 px-6" 
                onPress={()=>handleSocialAuth('oauth_apple')}
                style={{
                  shadowColor:'#000',
                  shadowOffset:{width:0,height:0},
                  shadowOpacity:0.4,
                  shadowRadius:2,
                  elevation:0.2
                 }} 
                  disabled={isLoading.apple}
                >
                    {
                      isLoading.apple ? (
                        <ActivityIndicator size={'small'} color={'#000'}/>
                      )
                      : 
                      (
                        <View className="flex-row items-center justify-center gap-5">

                           <Image
                              source={require('../../assets/images/apple.png')}
                              alt="Apple logo"
                              className="size-9"
                              resizeMode="contain"
                            />

                            <Text className="font-medium text-xl">
                              Continue with Apple
                            </Text>

                        </View>
                      )
                    }
               
                </TouchableOpacity>

              </View>



              <Text className="text-sm text-gray-600 text-center px-2 mt-7">
                By continuing, you agree to our <Text className='text-blue-500'>Terms of Service</Text> , <Text className="text-blue-500">Privacy Policy</Text> and <Text className="text-blue-500">Cookies use</Text>

              </Text>


          </View>
       </View>
      
    </View>
  );
}
