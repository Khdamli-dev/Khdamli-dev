import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Fontisto';
import Icoon from 'react-native-vector-icons/AntDesign';
import { KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from "expo-router";


import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";

import { useFonts } from 'expo-font';


export default function Login() {

  const [fontsLoaded] = useFonts({
    'Itim': require('../../assets/fonts/Itim-Regular.ttf'),
    'GrechenFuemen': require('../../assets/fonts/GrechenFuemen-Regular.ttf'),
  });
  

  const router = useRouter();


  const [loginError, setLoginError] = useState(""); 
 
  // Data
  const loginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid Email").required("Email Is Required"),
    password: Yup.string().min(8, "The password is short").required("Password Is Required"),
  });

  // handlogin 
  const handleLogin = async (values: { email: string; password: string }) => {
    setLoginError(""); // 
   
    try {
      const response = await axios.post("https://your-api.com/login", values);
      if (response.data.success) {
        router.push("/+not-found"); // 
         
      }else{
        setLoginError("The Email Or The Password is Incorrect");
        alert(loginError)
      }
    } catch (error) {
      setLoginError("Error");
      alert(loginError)
    }
   
  };


  

  return (
    <SafeAreaView className="flex-1 min-h-screen bg-specialGreen ">
      <KeyboardAvoidingView  behavior={Platform.OS === "ios" ? "padding" : "padding"} className='' style={{ flex: 1 }} >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} >


        

          {/* Main Login Section */}
          <View className="bg-specialGreen flex-1 items-center px-4 ">

            {/* Profile Image */}
            <Image
              source={require('../../assets/images/photo_2025-02-04_10-16-04.jpg')}
              className="w-96 h-60 rounded-full mb-6 mt-14 "
            />
            < View className="flex-row w-96 mt-1 items-baseline ">
              <Text style={{ textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }} className="text-9xl  tracking-tight text-foncyYellow uppercase font-bold ">KH</Text>
              <Text style={{ textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }} className="text-7xl tracking-widest text-bl lowercase font-bold">damli</Text>
            </View>
            <Text style={{ textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }}   className="text-4xl font-medium text-white mb-10 text-shadow-sm shadow-red-500" >Home Services App</Text>
          </View>
          {/* Form */}

          <Formik

            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={(values) => {handleLogin(values)
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View className='w-full  '>
                <View className='relative w-10/12 h-20 my-2 self-center '>
                  <Icoon name="user" color="#C4C4C4" size={30} className='absolute left-14 top-6  text-2xl font-bold ' />
                  <TextInput
                    className=" absolute w-full h-full text-white text-2xl font-medium border-2 border-white rounded-full pl-28 py-2"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder='Email '
                    placeholderTextColor="#C4C4C4"
                    scrollEnabled
                  />

                </View>

                {touched.email && errors.email && <Text className='text-center' style={{ color: "red" }}>{errors.email}</Text>}

                <View className='relative w-10/12 h-20 my-2 self-center '>
                  <Icon name="locked" color="#C4C4C4" size={28} className='absolute left-16 top-6  text-2xl font-bold ' />
                  <TextInput
                    className=" absolute w-full h-full text-white text-2xl font-medium border-2 border-white rounded-full pl-28  py-2"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    secureTextEntry
                    placeholder='Password'
                    placeholderTextColor="#C4C4C4"
                  />
                </View>

                {touched.password && errors.password && <Text className='text-center' style={{ color: "red" }}>{errors.password}</Text>}

                {/* buttons */}
                <View className=" bg-white p-3 w-full items-center rounded-tl-[50px] mt-10  rounded-tr-[50px] shadow-xl">

                  {/* Forgot Password */}
                  <TouchableOpacity onPress={() => router.push("/(auth)/(RestorAccount)/ForgotPassword")} >
                    <Text className="text-specialGreen mb-6 text-lg font-bold">Forgot Password ?</Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <TouchableOpacity onPress={handleSubmit as any} className="bg-specialGreen p-6 rounded-full w-full max-w-sm  shadow-md shadow-black">
                    <Text className="text-white text-center font-bold text-xl">Login</Text>
                  </TouchableOpacity>

                  {/*Or */}


                  <Text className="mx-2 my-2 text-specialGreen text-3xl font-bold">or</Text>



                  {/* Sign Up Button  */}

                  <TouchableOpacity onPress={() => router.push("/(auth)/(signUp)/SignUp")} className="bg-specialGray p-6 rounded-full w-full max-w-sm shadow-md shadow-black mb-8">
                    <Text className="text-foncyGreen text-center font-medium text-3xl">Create an account</Text>
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
