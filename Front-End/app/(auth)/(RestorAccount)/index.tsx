import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Octicons";
import Icoon from "react-native-vector-icons/AntDesign";
import CONFIG from "../../../config"
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

export default function ForgotPassword() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const router = useRouter();

  const [ForgotError, setForgotError] = useState("");

  const resetSchema = Yup.object().shape({
    email: Yup.string().email("Invalid Email").required("Email Is Required"),
  });

  

  const handleReset = async (values: { email: string }) => {
    try {
      
      const response = await axios.post(
        `${CONFIG.API_URL}/auth/password-reset/request`,
        { credentials: { email: values.email } }
      );

     
      
      if (response.status == 200) {
        console.log(response.data)
        const id: number = response.data.userId;
        await AsyncStorage.setItem("userId", JSON.stringify(id));
        router.push({
          pathname: "./Verification",
          params: { email: values.email },
        });

        alert("Code sent successfully!");
      } else {
        setForgotError("The Email doesn't exist");
      }
    } catch (error: any) {
      if (error.status === 404){
        setForgotError("User not found")
      }
      else if(error.status === 403){
        setForgotError("you need to validate your account first")
      }
      else if(error.status === 429){
        setForgotError("OTP resend not allowed. Please wait until the previous OTP expires.")
      }
      else {
        setForgotError("internal server error")
      }
      
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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
            <View className="w-full mb-4 items-start justify-start ">
              <TouchableOpacity onPress={() => router.back()}>
                <Icoon name="left" size={60} color="white" />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                textShadowColor: "#fffff",
                textShadowOffset: { width: 1, height: 6 },
                textShadowRadius: 5,
              }}
              className="my-5 px-12 text-6xl font-medium text-white"
            >
              Forgot
            </Text>
            <Text
              style={{
                textShadowColor: "#fffff",
                textShadowOffset: { width: 1, height: 6 },
                textShadowRadius: 5,
              }}
              className="mb-5 px-12  text-6xl font-medium text-white"
            >
              Password
            </Text>
          </LinearGradient>

           {/* Icon !&& Text Section */}
          <View className="felx items-center justify-center">
         
          <View className="relative w-full  h-56 flex items-center justify-center">
            <Icon name="shield-lock" color="#4C8479" size={140} />
          </View>

            <Text className=" w-9/12 text-center  font-normal text-2xl text-black leading-10">
              Enter your email and
           
              we'll send you a code to reset your
              password
            </Text>
         
          </View>

          <Formik
            initialValues={{ email: "" }}
            validationSchema={resetSchema}
            onSubmit={(values) => {
              handleReset(values);
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldTouched,
              values,
              errors,
              touched,
            }) => (
              <View className="flex justify-center items-center">
                <View className="relative w-full  h-32 flex items-center justify-center">
                  <TextInput
                    className={`w-9/12 h-16 text-2xl  border-red-600 border-0 ${ ForgotError ||(errors.email && touched.email ) ? " border-2":""} rounded-full px-8 py-2 bg-white`}
                    value={values.email}
                    onChangeText={handleChange("email")}
                    keyboardType="email-address"
                    placeholder="Email"
                    placeholderTextColor="#C4C4C4"
                    onFocus={() => {
                     
                      setForgotError("");
                      setFieldTouched("email", false);
                    }}
                    onBlur={() => {
                      
                      handleBlur("email");
                    }}
                  />
                </View>
                {touched.email && errors.email && (
                  <Text className="text-center text-red-600 text-lg  w-9/12">
                    {errors.email}
                  </Text>
                )}
                {ForgotError && (<Text className="text-center text-red-600 text-lg  w-9/12">
                    {ForgotError}
                  </Text>)}
                <View className="relative w-full  h-32 flex items-center justify-center">
                  <TouchableOpacity
                    onPress={handleSubmit as any}
                    className="bg-specialGreen p-4 rounded-full  max-w-sm shadow-md shadow-black w-11/12 "
                  >
                    <Text className="text-white text-center font text-3xl lg:text-xl">
                      Reset Password
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
          <View className="relative w-full  h-32 flex items-center justify-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-specialGreen p-4 w-11/12 rounded-full  max-w-sm shadow-md shadow-black  "
            >
              <Text className="text-white text-center font text-3xl lg:text-xl">
                Back To Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}