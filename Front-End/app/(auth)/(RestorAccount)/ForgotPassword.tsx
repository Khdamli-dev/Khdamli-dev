import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, SafeAreaView, ScrollView, KeyboardAvoidingView, Dimensions, TouchableOpacity,
  Alert, Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import Icoon from 'react-native-vector-icons/AntDesign'

import { TouchableWithoutFeedback, Keyboard } from 'react-native';

import { StackNavigationProp } from '@react-navigation/stack';

import { useRouter } from "expo-router";


import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";

import { LinearGradient } from 'expo-linear-gradient';





export default function ForgotPassword() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const router = useRouter();

  const [ForgotError, setForgotError] = useState("");


  const resetSchema = Yup.object().shape({
    email: Yup.string().email("Invalid Email").required("Email Is Required"),
  });

  const handleReset = async (values: { email: string }) => {
    setForgotError("");

    try {
      const response = await axios.post("https://your-api.com/login", values);
      if (response.data.success) {
        router.push({ pathname: "./Verification", params: { email: values.email } });
        alert("Code sent successfully!");
      } else {
        setForgotError("The Email  dosn\'t exist");
        alert(ForgotError)
      }
    } catch (error) {
      setForgotError("Error ");
      alert(ForgotError)
    }

  };
  return (

    <SafeAreaView className="flex-1 bg-gray-200">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          

            {/* Header Section */}
            <LinearGradient colors={['#2B524A', '#5EB4A2']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={{ borderBottomLeftRadius: screenWidth * 0.1, borderBottomRightRadius: screenWidth * 0.1 }} className=' w-full mb-safe-offset-2 pt-6  pb-2  shadow-md shadow-black'>
              <View className='w-full mb-4 items-start justify-start '>
                              <TouchableOpacity onPress={() => router.back()}>
                                <Icoon name="left" size={60} color="white" />
                              </TouchableOpacity>
                            </View>
              <Text className="my-5 px-12 text-6xl font-medium text-white">Forgot</Text>
              <Text className="mb-5 px-12  text-6xl font-medium text-white">Password</Text>
            </LinearGradient>

            {/* Icon Section */}
            <View className="relative w-full  h-56 flex items-center justify-center">
              <Icon name="shield-lock" color="#4C8479" size={140} />
            </View>
            <View className="relative w-full h-40 flex items-center justify-center ">
              <Text className='font-normal text-2xl text-black leading-10'>Enter your email and</Text>
              <Text className='font-normal text-2xl text-black leading-10'>we'll send you a code to reset your</Text>
              <Text className='font-normal text-2xl text-black leading-10'>password</Text>
            </View>


            <Formik

              initialValues={{ email: "" }}
              validationSchema={resetSchema}
              onSubmit={(values) => {
                handleReset(values);  
            }}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
                  <View className="relative w-full  h-32 flex items-center justify-center">
                    <TextInput
                      className="w-9/12 h-16 text-black text-2xl font-bold  border-0 rounded-full px-8 py-2 bg-white"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholder='Email'
                      scrollEnabled
                      placeholderTextColor="#C4C4C4"
                    />
                  </View>
                  {touched.email && errors.email && <Text className='text-center' style={{ color: "red" }}>{errors.email}</Text>}

                  <View className="relative w-full  h-32 flex items-center justify-center">
                    <TouchableOpacity
                      onPress={() => router.push("./Verification")}
                      className="bg-specialGreen p-4 rounded-full  max-w-sm shadow-md shadow-black w-full "
                    >
                      <Text className="text-white text-center font text-3xl lg:text-xl">Reset Password</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              )}
            </Formik>
            <View className="relative w-full  h-32 flex items-center justify-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-specialGreen p-4 rounded-full  max-w-sm shadow-md shadow-black w-full "
              >
                <Text className="text-white text-center font text-3xl lg:text-xl">Back To Login</Text>
              </TouchableOpacity>
            </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
