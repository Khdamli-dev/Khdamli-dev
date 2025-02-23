import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  BackHandler,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/Fontisto";
import AntDesign from "react-native-vector-icons/AntDesign";
import Foundation from "react-native-vector-icons/Foundation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import { KeyboardAvoidingView, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";

import { LinearGradient } from "expo-linear-gradient";

export default function OtherInformation() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const router = useRouter();

  //Creat validationSchema
  const validationSchema = Yup.object().shape({
    age: Yup.number()
      .required("Age is required")
      .min(18, "You must be at least 18 years old")
      .max(100, "Age cannot be more than 100 years old"),
    sex: Yup.number().required("Gender is required"),
  });

  // handleOtherInfermation
  const handleOtherInfermation = async ({
    age,
    sex,
  }: {
    age: number;
    sex: number;
  }) => {
    const personalInfo = {
      age,
      sex,
    };
    // Retrieve userId from AsyncStorage
    const storedId = await AsyncStorage.getItem("userId");
    const id: number = Number(storedId); // Convert string to number safely

    try {
      const response = await axios.post(`${API_URL}/signup/personal-info`, {
        personalInfo,
        id,
      });
      if (response) {
        router.push("/+not-found");
      } else {
        alert(
          "en error occurred with the submitted data. Please check your inputs"
        );
      }
    } catch (error) {
      alert("Server is busy, please try again later.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/*  */}
          {/*OtherInformation*/}
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
            {/* Go back Icon & Skip Icon */}
            <View className=" w-full h-20  flex-row justify-between items-center pr-6 ">
              <View className="  items-start justify-start ">
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
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => router.push("/selectionRole")}
                  className="flex-1 flex items-center justify-center "
                >
                  <Text
                    style={{
                      textShadowColor: "#000",
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 5,
                    }}
                    className="text-white text-4xl"
                  >
                    Skip
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="px-10 py-8  ">
              <Text
                style={{
                  textShadowColor: "#000",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 5,
                }}
                className=" mb-4 text-6xl  font-semibold text-white"
              >
                Other
              </Text>
              <Text
                style={{
                  textShadowColor: "#000",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 5,
                }}
                className=" text-6xl  font-semibold text-white"
              >
                Information
              </Text>
            </View>
          </LinearGradient>

          <View className="flex items-center justify-center  w-full h-24 mb-8 ">
            <Text className="text-xl font-medium">
              This Step Is Optional ,But You Must Be {"\n"}
              {"  "}18 Or Older To Proceed,You Can Edit{"\n"}
              {"       "}It Later On your Personal Page
            </Text>
          </View>

          <Formik
            initialValues={{ age: "", sex: 0 }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              handleOtherInfermation({
                age: Number(values.age),
                sex: values.sex,
              });
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <View className="flex-1 w-full items-center  justify-center">
                <View className=" relative w-80 h-20 mt-2 mb-7 self-center ">
                  <AntDesign
                    name="idcard"
                    color="#ffffff"
                    size={28}
                    className="bg-specialGreen absolute left-6 top-6  text-2xl font-bold "
                  />
                  <TextInput
                    className=" absolute w-full h-full text-specialGreen text-xl font-bold border-2 border-specialGreen rounded-full pl-16 py-2"
                    value={values.age}
                    onChangeText={handleChange("age")}
                    onBlur={handleBlur("age")}
                    keyboardType="numeric"
                    inputMode="numeric"
                    placeholder="Enter Your Age +18"
                    placeholderTextColor="#4C8479"
                    scrollEnabled
                  />
                </View>
                {touched.age && errors.age && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.age}
                  </Text>
                )}

                <View className="relative  w-96 h-20 rounded-full mt-6 mb-4 border-2 border-specialGreen shadow-neutral-950  ">
                  <Foundation
                    name="female-symbol"
                    color="#F8A100"
                    size={40}
                    className="absolute left-80 top-2    font-bold p-5 "
                  />
                  <Foundation
                    name="male-symbol"
                    color="black"
                    size={40}
                    className="absolute right-3 bottom-[0] p-5"
                  />
                  <Text className="text-specialGreen absolute top-6 left-4 text-2xl font-semibold">
                    Please Select Your Gender{" "}
                  </Text>
                </View>

                <View className="flex-row w-full h-40  items-center justify-center ">
                  <Pressable
                    className="rounded-xl mr-5  h-10 bg-specialGreen  w-36 flex-row justify-between items-center px-4"
                    onPress={() => setFieldValue("sex", 1)}
                  >
                    <Text className="text-white text-2xl font-bold">Male</Text>
                    <Icon
                      name={
                        values.sex === 1
                          ? "radio-btn-active"
                          : "radio-btn-passive"
                      }
                      color="white"
                      size={24}
                    />
                  </Pressable>
                  <Pressable
                    className="rounded-xl ml-5 h-10 bg-specialGreen  w-36 flex-row justify-between items-center px-3"
                    onPress={() => setFieldValue("sex", 2)}
                  >
                    <Text className="text-white text-2xl font-bold">
                      Female
                    </Text>
                    <Icon
                      name={
                        values.sex === 2
                          ? "radio-btn-active"
                          : "radio-btn-passive"
                      }
                      color="white"
                      size={24}
                    />
                  </Pressable>
                </View>

                <View className="  flex-1 w-full items-center  justify-center pb-8 ">
                  <TouchableOpacity
                    onPress={handleSubmit as any}
                    className="flex items-center justify-center rounded-full w-80 h-20 bg-specialGreen"
                  >
                    <Text className="text-white font-medium text-3xl">
                      Next
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
