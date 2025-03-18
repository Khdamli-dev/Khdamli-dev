import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Pressable,
  Platform,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { FontAwesome } from "@expo/vector-icons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NavigationContainer } from "@react-navigation/native";
/* import BottomTabs from "../BottomTabs"; */
const Home = () => {
  console.log("hellow world..........................................");
  
  return (
    <SafeAreaView className="flex-1 min-h-screen">
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <ImageBackground
            source={require("../../../assets/images/construction_worker_job_description_7ae1e612e2.jpg")}
            className="relative w-full h-64"
          >
            <View className="absolute inset-0 bg-specialGreen/85">
              <View className=" h-20 flex-row items-center justify-between px-3 pl-4">
                <View className="">
                  <Text className="text-3xl text-white">Location</Text>
                  <View className=" items-center justify-center flex-row">
                    {/* icon .......location-pin*/}
                    <Entypo name="location-pin" color="#F8A100" size={30} />
                    <Text className="text-xl text-foncyYellow font-bold">
                      Sidi belabeese ,Algerie
                    </Text>
                  </View>
                </View>
                {/* icon.......notifications */}
                <MaterialIcons
                  name="notifications"
                  color="#F8A100"
                  size={50}
                  className="  p-3"
                />
              </View>
              <View className=" mt-9 pl-5">
                <Text className="text-5xl text-white font-medium">
                  How Can We Help {"\n"}You Today ?
                </Text>
              </View>
            </View>
          </ImageBackground>
          <View className="items-center ">
            <View className="  items-center relative  w-10/12 mt-[-24] ">
              <TextInput
                className="bg-white w-full rounded-xl h-14 pl-20 text-xl"
                placeholder="Search for categories"
              />
              <AntDesign
                name="search1"
                color="#708090"
                size={26}
                className="absolute left-9 bottom-3"
              />
            </View>
          </View>
          <View className=" h-16 flex-row justify-between items-end pb-3 px-3">
            <Text className="text-2xl font-bold">Top Requests</Text>
            <Text className="text-xl text-foncyYellow font-medium">
              Click on Service
            </Text>
          </View>
          <View className=" h-32 flex-row bg-white mb-2">
            <View className="-700 pt-1 pl-1">
              {/* 1 */}
              <Image
                className="w-20 h-20 rounded-full"
                source={require("../../../assets/images/images.jpg")}
              />
            </View>

            <View className="w-11/12 ">
              <View className="flex-row w-full  h-4/6">
                <View className=" w-2/5 pl-3">
                  {/* 2 */}
                  <Text className="text-xl ">Mohamed Amin</Text>
                  <Text className="font-medium leading-8">
                    I Need <Text className="text-foncyYellow">Carpenter</Text>
                  </Text>
                  <Text className="text-foncyGreen font-medium">
                    "08:00 - 16:00"
                  </Text>
                </View>

                <View className=" w-3/5 items-center justify-between pt-2 pb-2 ">
                  <TouchableOpacity className="bg-specialGreen rounded-full py-1 px-3  w-40 justify-center">
                    <Text className="text-white">Submit Request ✓</Text>
                  </TouchableOpacity>

                  <TouchableOpacity className=" rounded-full py-1 px-3  w-40 justify-center bg-red-700">
                    <Text className="text-white">Remove Request X</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className=" flex-1 h-2/6  pt-4 pl-3 ">
                {/* 3 */}
                <Text>
                  In:{" "}
                  <Text className="font-medium text-foncyYellow">
                    {" "}
                    Batna - barika
                  </Text>
                  {"      "}
                  Phone :{"  "}
                  <Text className="text-foncyYellow font-medium">
                    0697-49-48-85
                  </Text>
                </Text>
              </View>
            </View>
          </View>

          {/* secand post  */}
          <View className="  bg-white mb-2">
            <View className=" h-32 flex-row ">
              <View className=" pt-1 pl-1 ">
                {/* 1 */}
                <Image
                  className="w-20 h-20 rounded-full"
                  source={require("../../../assets/images/360_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg")}
                />
              </View>

              <View className="w-11/12 ">
                <View className="flex-row w-full   h-4/6">
                  <View className=" w-2/5 pl-3 e-600">
                    {/* 2 */}
                    <Text className="text-xl ">Mohamed Amin</Text>
                    <Text className="font-medium leading-8">
                      I Need <Text className="text-foncyYellow">Carpenter</Text>
                    </Text>
                    <Text className="text-foncyGreen font-medium">
                      "08:00 - 16:00"
                    </Text>
                  </View>

                  <View className=" w-3/5  items-center justify-between pt-2 pb-2 ">
                    <TouchableOpacity className="bg-specialGreen rounded-full py-1 px-3  w-40 justify-center">
                      <Text className="text-white">Submit Request ✓</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className=" rounded-full py-1 px-3  w-40 justify-center bg-red-700">
                      <Text className="text-white">Remove Request X</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className=" flex-1 h-2/6  pt-4 pl-3  ">
                  {/* 3 */}
                  <Text>
                    In:{" "}
                    <Text className="font-medium text-foncyYellow">
                      {" "}
                      Batna - barika
                    </Text>
                    {"      "}
                    Phone :{"  "}
                    <Text className="text-foncyYellow font-medium">
                      0697-49-48-85
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
            <View className="w-full py-1  items-center justify-center">
              <Image
                source={require("../../../assets/images/istockphoto-615086822-170667a.jpg")}
                className="w-10/12  h-64 rounded-3xl"
              />
            </View>
          </View>
          {/* third post */}
          <View className=" h-32 flex-row bg-white mb-2">
            <View className="-700 pt-1 pl-1">
              {/* 1 */}
              <Image
                className="w-20 h-20 rounded-full"
                source={require("../../../assets/images/images (1).jpg")}
              />
            </View>

            <View className="w-11/12 ">
              <View className="flex-row w-full  h-4/6">
                <View className=" w-2/5 pl-3">
                  {/* 2 */}
                  <Text className="text-xl ">Mohamed Amin</Text>
                  <Text className="font-medium leading-8">
                    I Need <Text className="text-foncyYellow">Carpenter</Text>
                  </Text>
                  <Text className="text-foncyGreen font-medium">
                    "08:00 - 16:00"
                  </Text>
                </View>

                <View className=" w-3/5 items-center justify-between pt-2 pb-2 ">
                  <TouchableOpacity className="bg-specialGreen rounded-full py-1 px-3  w-40 justify-center">
                    <Text className="text-white">Submit Request ✓</Text>
                  </TouchableOpacity>

                  <TouchableOpacity className=" rounded-full py-1 px-3  w-40 justify-center bg-red-700">
                    <Text className="text-white">Remove Request X</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className=" flex-1 h-2/6  pt-4 pl-3 ">
                {/* 3 */}
                <Text>
                  In:{" "}
                  <Text className="font-medium text-foncyYellow">
                    {" "}
                    Batna - barika
                  </Text>
                  {"      "}
                  Phone :{"  "}
                  <Text className="text-foncyYellow font-medium">
                    0697-49-48-85
                  </Text>
                </Text>
              </View>
            </View>
          </View>

          {/* forth post */}
          <View className="  bg-white mb-2">
            <View className=" h-32 flex-row ">
              <View className=" pt-1 pl-1 ">
                {/* 1 */}
                <Image
                  className="w-20 h-20 rounded-full"
                  source={require("../../../assets/images/AdobeStock_577973144-1024x683.jpeg")}
                />
              </View>

              <View className="w-11/12 ">
                <View className="flex-row w-full   h-4/6">
                  <View className=" w-2/5 pl-3 e-600">
                    {/* 2 */}
                    <Text className="text-xl ">Mohamed Amin</Text>
                    <Text className="font-medium leading-8">
                      I Need <Text className="text-foncyYellow">Carpenter</Text>
                    </Text>
                    <Text className="text-foncyGreen font-medium">
                      "08:00 - 16:00"
                    </Text>
                  </View>

                  <View className=" w-3/5  items-center justify-between pt-2 pb-2 ">
                    <TouchableOpacity className="bg-specialGreen rounded-full py-1 px-3  w-40 justify-center">
                      <Text className="text-white">Submit Request ✓</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className=" rounded-full py-1 px-3  w-40 justify-center bg-red-700">
                      <Text className="text-white">Remove Request X</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className=" flex-1 h-2/6  pt-4 pl-3  ">
                  {/* 3 */}
                  <Text>
                    In:{" "}
                    <Text className="font-medium text-foncyYellow">
                      {" "}
                      Batna - barika
                    </Text>
                    {"      "}
                    Phone :{"  "}
                    <Text className="text-foncyYellow font-medium">
                      0697-49-48-85
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
            <View className="w-full py-1  items-center justify-center">
              <Image
                source={require("../../../assets/images/craft-latin-american-worker-his-600nw-2166487721.webp")}
                className="w-10/12  h-64 rounded-3xl"
              />
            </View>
          </View>
          {/* fifth post */}
        </ScrollView>
      </KeyboardAvoidingView>
      
    </SafeAreaView>
  );
};

export default Home;
