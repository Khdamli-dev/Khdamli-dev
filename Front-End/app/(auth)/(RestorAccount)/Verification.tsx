import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Fontisto from "react-native-vector-icons/Fontisto";

import AntDesign from "react-native-vector-icons/AntDesign";
import { useRouter } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";

export default function VerficationCode() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const [Code, setCode] = useState("");
  const router = useRouter();
  //handleVerification
  const handleVerification = async () => {
    try {
      const response = await axios.post("https://your-api.com/login", {
        code: Code,
      });
      if (response.data.success) {
        router.push("./Verification");
      } else {
        alert("Incorrect Code");
      }
    } catch (error) {
      alert("Error");
    }
  };

  //Resend Code
  const [timer, setTimer] = useState(0); //
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handelResendCode = async () => {
    if (timer > 0) return;
    const { email } = useLocalSearchParams(); //Get the Email
    try {
      await axios.post("https://your-api.com/resend-code", { email });
      alert("Code sent successfully!");
      setTimer(120);
    } catch (error) {
      alert("Failed to resend code");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
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
            <>
              <View className="w-full mb-4 items-start justify-start ">
                <TouchableOpacity onPress={() => router.back()}>
                  <AntDesign
                    name="left"
                    size={60}
                    color="white"
                    style={{
                      textShadowColor: "#000",
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 5,
                    }}
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  textShadowColor: "#fffff",
                  textShadowOffset: { width: 1, height: 6 },
                  textShadowRadius: 5,
                }}
                className="my-5 pl-12 text-6xl font-medium text-white "
              >
                Verification
              </Text>
              <Text
                style={{
                  textShadowColor: "#fffff",
                  textShadowOffset: { width: 1, height: 6 },
                  textShadowRadius: 5,
                }}
                className="mb-5 pl-12 text-6xl font-medium text-white"
              >
                Code
              </Text>
            </>
          </LinearGradient>

          {/* Icon Section */}
          <View className="relative w-full  h-56 flex items-center justify-center ">
            <Fontisto name="key" color="#4C8479" size={100} />
          </View>
          <View className="relative w-full h-40 flex items-center justify-center ">
            <Text className="font-medium text-4xl  leading-10 pb-2">
              Please Enter
            </Text>
            <Text className="font-medium text-4xl  leading-10">
              The Code That Was Sent
            </Text>
          </View>
          <View className="relative w-full  h-32 flex items-center justify-center   ">
            <TextInput
              className="w-9/12 h-16 text-specialGreen text-2xl font-bold  border-0 rounded-full pl-9 py-2 bg-white"
              value={Code}
              onChangeText={setCode}
              inputMode="numeric"
              placeholder="Enter the code"
              placeholderTextColor="#C4C4C4"
              keyboardType="numeric"
            />
          </View>

          <View className="relative w-full  h-48 flex items-center justify-center    ">
            <TouchableOpacity
              onPress={handleVerification}
              className="bg-specialGreen p-4 rounded-full  max-w-96 shadow-md shadow-black w-full "
            >
              <Text className="text-white text-center font text-3xl lg:text-xl ">
                Confirm
              </Text>
            </TouchableOpacity>
            <View
              style={{ flexDirection: "row", alignItems: "center" }}
              className="pt-4"
            >
              <Text style={{ color: "#8F8F8F" }}>Didn't Receive Code? </Text>
              <TouchableOpacity onPress={handelResendCode} disabled={timer > 0}>
                <Text
                  style={{
                    color: timer > 0 ? "#ff0000" : "#000",
                    fontWeight: "bold",
                  }}
                  className=""
                >
                  {timer > 0 ? ` RESEND IN ${timer}s` : " RESEND NOW"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
