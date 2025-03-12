import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import CONFIG from "../../../config"
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SelectRole() {
  const { width: screenWidth } = Dimensions.get("window");
  const router = useRouter();
  // change the role of user if it is worker
  const handleWorkerRole = async () => {
    try {
      //Get the user Id
      const storedId = await AsyncStorage.getItem("userId");
      const id: number = Number(storedId);

      const response = await axios.post(
        `${CONFIG.API_URL}/profile/update/role/worker`,
        { userId: id }
      );
      router.replace("/(auth)/(signUp)/workerInfo");
    } catch (error: any) {
      alert("Server is busy, please try again later");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header Section */}
          <LinearGradient
            colors={["#2B524A", "#5EB4A2"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              borderBottomLeftRadius: screenWidth * 0.1,
              borderBottomRightRadius: screenWidth * 0.1,
            }}
            className=" w-full mb-safe-offset-2 pt-6  pb-2  shadow-md shadow-black"
          >
            <TouchableOpacity onPress={() => router.back()}>
              <AntDesign
                style={{
                  textShadowColor: "#000",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 5,
                }}
                name="left"
                size={60}
                color="white"
              />
            </TouchableOpacity>
            <View className="pl-6  pt-6 pb-16  shadow-md shadow-black">
              <Text
                style={{
                  textShadowColor: "#000",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 5,
                }}
                className="my-4 text-5xl font-semibold text-white"
              >
                Select Your
              </Text>
              <Text
                style={{
                  textShadowColor: "#000",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 5,
                }}
                className="text-5xl font-semibold text-white "
              >
                Role
              </Text>
            </View>
          </LinearGradient>

          {/* Role Selection Cards */}
          <View className="flex-1 w-full flex items-center justify-center my-6 h-full ">
            {/* Worker Card */}
            <TouchableOpacity
              onPress={handleWorkerRole as any}
              className="bg-white w-96 rounded-2xl shadow-lg p-6 mb-16"
            >
              <View className="flex items-center">
                <View className=" px-3 rounded-full">
                  <MaterialCommunityIcons
                    name="account-hard-hat"
                    size={70}
                    color="#F8A100"
                  />
                </View>
                <Text className=" text-4xl  font-semibold ">Worker</Text>
              </View>
              <View className="w-full border-b-2 border-gray-300 my-3" />
              <View className="flex-row items-center px-0">
                <View className="rounded-full bg-foncyYellow p-2 ">
                  <MaterialCommunityIcons
                    name="medal"
                    size={40}
                    color="black"
                  />
                </View>

                <Text className="ml-2 text-sm font-semibold">
                  As A Worker You Can - Receiving And {"\n"}Managing Orders -
                  Communicating With {"\n"}Clients - Managing Comments And
                  Ratings
                </Text>
              </View>
            </TouchableOpacity>

            {/* Clients Card */}
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/(signUp)/terms")}
              className="bg-white w-96 rounded-2xl shadow-lg p-6 "
            >
              <View className="flex items-center ">
                <MaterialCommunityIcons
                  name="account"
                  size={70}
                  color="#F8A100"
                  className=""
                />

                <Text className="text-4xl font-semibold mt-0">Client</Text>
              </View>
              <View className="w-full border-b-2 border-gray-300 my-3" />
              <View className="flex-row items-center px-0">
                <View className="bg-foncyYellow p-2 rounded-full">
                  <MaterialCommunityIcons
                    name="medal"
                    size={40}
                    color="black"
                  />
                </View>

                <Text className="ml-2 text-sm font-semibold">
                  As A Client You Can - Contact And Find {"\n"}Workers - Compare
                  Services - Submit{"\n"} Requests
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
