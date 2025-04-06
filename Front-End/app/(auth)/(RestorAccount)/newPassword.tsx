import React, { useState } from "react";
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
import AntIcon from "react-native-vector-icons/AntDesign";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import CONFIG from "../../../config"



import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NewPassword() {
  const { width: screenWidth } = Dimensions.get("window");
  const router = useRouter();

  // Validation schema using Yup
  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .required("Password is required")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*#.?&_-]).{8,64}$/,
        "Password must be 8-64 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character"
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), undefined], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const [showePassword, setShowePassword] = useState(false);
  
  const [error, setError] = useState("");
  const handleNewPassword = async (values: {
    newPassword: string;
    confirmPassword:string;
  }) => {
    try {
      const storedId = await AsyncStorage.getItem("userId");
      const id: number = Number(storedId);
      
      const response = await axios.put(
        `${CONFIG.API_URL}/users/${id}`,
        { credentials: { password: values.newPassword } }
      );
     
      if (response.status == 200) {
        
        router.back();
        alert("Your password has been changed successfully");
      } 
    } catch (error: any) {
      console.log(error)
      setError("Internal server error");
      setTimeout(() => setError(""), 50000); 
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
            className="w-full mb-safe-offset-2 pt-6 pb-2 shadow-md shadow-black"
          >
            <View className="w-full mb-4 items-start justify-start">
              <TouchableOpacity onPress={() => router.back()}>
                <AntIcon name="left" size={60} color="white" />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                textShadowColor: "black",
                textShadowOffset: { width: 1, height: 6 },
                textShadowRadius: 5,
              }}
              className="my-5 px-12 text-6xl font-medium text-white"
            >
              New
            </Text>
            <Text
              style={{
                textShadowColor: "black",
                textShadowOffset: { width: 1, height: 6 },
                textShadowRadius: 5,
              }}
              className="mb-5 px-12 text-6xl font-medium text-white"
            >
              Password
            </Text>
          </LinearGradient>

          {/* Icon Section */}
          <View className="relative w-full h-56 flex items-center justify-center">
            <MaterialCommunityIcons
              name="lock-reset"
              color="#4C8479"
              size={205}
            />
          </View>

          <Formik
            initialValues={{ newPassword: "", confirmPassword: "" }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              handleNewPassword(values);
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
                <View className="relative w-9/12 h-32 flex items-center justify-center">
                  <TextInput
                    className="w-full h-16 text-black text-2xl font-bold border-0 rounded-full pl-8 pr-14 py-2 bg-white"
                    placeholder="New Password"
                    value={values.newPassword}
                    secureTextEntry={!showePassword}
                    onChangeText={handleChange("newPassword")}
                    onBlur={handleBlur("newPassword")}
                    onFocus={() => {
                      setFieldTouched("newPassword", false);
                    }}
                    scrollEnabled
                    placeholderTextColor="#C4C4C4"
                  />
                  <TouchableOpacity onPress={()=>setShowePassword(!showePassword)} className="absolute right-3">
                  <MaterialCommunityIcons name="eye" color={showePassword ? '#4C8479' : '#BED2D0'} size={30}  />
                  </TouchableOpacity>
                </View>
                {errors.newPassword && touched.newPassword  && (
                  <Text className="text-center text-red-600 text-lg  w-9/12" >
                    {errors.newPassword}
                  </Text>
                )}
                <View className="relative w-full h-32 flex items-center justify-center">
                  <TextInput
                    className="w-9/12 h-16 text-black text-2xl font-bold border-0 rounded-full pl-8 pr-14 py-2 bg-white"
                    placeholder="Confirm Password"
                    secureTextEntry={!showePassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    onFocus={() => {
                      setFieldTouched("confirmPassword", false);
                    }}
                    value={values.confirmPassword}
                    scrollEnabled
                    placeholderTextColor="#C4C4C4"
                  />
                </View>
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text className="text-center text-red-600 text-lg  w-9/12 mb-8">
                    {errors.confirmPassword}
                  </Text>
                )}

                  <TouchableOpacity
                    onPress={handleSubmit as any}
                    className="bg-specialGreen p-6  rounded-full w-11/12 max-w-sm shadow-md shadow-black mb-8"
                  >
                    <Text className="text-white text-center text-3xl lg:text-xl font-bold">
                      Confirm
                    </Text>
                  </TouchableOpacity>
                  {error && (
                  <Text className="my-2 text-center text-red-600 text-lg  w-9/12" >
                    {error}
                  </Text>
                )}
                
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}