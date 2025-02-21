import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Dimensions, Pressable, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Fontisto';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { KeyboardAvoidingView, ScrollView } from 'react-native';
import { API_URL } from '@env';

import { Formik } from "formik";
import * as Yup from "yup";
import { useRouter } from "expo-router";
import { isValidPhoneNumber } from 'libphonenumber-js';

import axios from "axios";

import { LinearGradient } from 'expo-linear-gradient';

import * as Linking from 'expo-linking';



export default function SignUp() {
    const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
    const router = useRouter();


    // Validation schema using Yup
    const validationSchema = Yup.object({
        username: Yup.string().required("Full Name Is Required"),
        email: Yup.string().email("Invalid email address").required("Email Is Required"),
        phoneNumber: Yup.string(),
        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password Is Required"),
        retypePassword: Yup.string().oneOf([Yup.ref('password'), undefined], "Passwords must match").required("Retype Password "),
        terms: Yup.boolean().oneOf([true], "You must accept the terms and conditions").required("You Must Agrre to The Terms"),
    });


    // handSignUp
    const handSignUp = async ({ username, email, phoneNumber, password } : { username: string, email: string, phoneNumber: string, password: string  }) => {
        const credentials = {
            username: username, // Rename userName to username
            email,
            phoneNumber : +phoneNumber,
            password,
          };
        console.log(API_URL);
        try {
            const response = await axios.post(`${API_URL}/signup/credentials`, {credentials});
            console.log(response);
            if (response.data.success) {
                console.log(response);
                alert("Check Your Email, We have sent you a verification link. Click on it to confirm your account.");
            } else {
                if (!response.data.username){
                    alert("username is used")
                }
                if (!response.data.phoneNumber)
                    alert("phone number is used");
                if (!response.data.email)
                    alert("email id used");
                if (!response.data.password)
                    alert("password is wrong format");
            }
        } catch (error) {
            console.log(error);
            alert("Server is busy, please try again later.");
        }

    };

    // Handle deep link for email verification
    useEffect(() => {
        const handleDeepLink = async (event: { url: string }) => {
            const url = event.url; 
            if (!url) return;
    
            let { path, queryParams } = Linking.parse(url);
            if (path === 'confirm-email' && queryParams?.token) {
                try {
                    const response = await axios.post("https://your-api.com/confirm-email", { token: queryParams.token });
                    if (response.data.success) {
                       alert("Success , Email verified successfully!");
                        router.push("/(auth)/(RestorAccount)/ForgotPassword");
                    } else {
                       alert("Error : Invalid or expired verification link.");
                    }
                } catch (error) {
                    alert("Error : Server error. Please try again later.");
                }
            }
        };
    
        const subscription = Linking.addEventListener('url', handleDeepLink);
    
        return () => {
            subscription.remove();
        };
    }, []);
    
    return (
        <SafeAreaView className="flex- min-h-screen ">
            <KeyboardAvoidingView  behavior={Platform.OS === "ios" ? "padding" : "padding"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                   
                   
                        {/* Header */}
                        <LinearGradient colors={['#2B524A', '#5EB4A2']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={{ borderBottomLeftRadius: screenWidth * 0.1, borderBottomRightRadius: screenWidth * 0.1 }} className=' w-full mb-safe-offset-2 pt-12  pb-2  shadow-md shadow-black'>
                            <View className="w-full flex-row justify-end items-center px-6">
                                <TouchableOpacity onPress={() => router.back()} className="flex-1 w-full flex items-end justify-end">
                                    <Text style={{ textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }} className="text-6xl text-white font-extrabold">X</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="px-10 pb-5 pt-5">
                                <Text style={{ textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }} className="my-5 text-6xl font-semibold text-white">Create New</Text>
                                <Text style={{ textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 }} className="mb-10 text-6xl font-semibold text-white">Account</Text>
                            </View>
                        </LinearGradient>

                        {/* Form */}
                        <Formik
                            initialValues={{ username: '', email: '', phoneNumber: '', password: '', retypePassword: '', terms: false }}
                            validationSchema={validationSchema}
                            onSubmit={(values) => {
                                handSignUp({username : values.username, password : values.password, phoneNumber : values.phoneNumber,
                                    email : values.email
                                })
                            }}
                        >
                            {({ values, handleChange, handleBlur, handleSubmit, errors, touched, setFieldValue }) => (
                                <View className='w-full flex-1 justify-center items-center  '>
                                    <View className="relative w-10/12 h-20 my-2 self-center">
                                        <FontAwesome6 name="user-large" color="#396F65" size={28} className="absolute left-14 top-6 text-2xl font-bold" />
                                        <TextInput
                                            className="absolute w-full h-full text-specialGreen text-2xl font-medium border-2 border-specialGreen rounded-full pl-28 py-2"
                                            value={values.username}
                                            onChangeText={handleChange('username')}
                                            onBlur={handleBlur('username')}
                                            placeholder="User Name"
                                            placeholderTextColor="#4C8479"
                                        />
                                    </View>
                                    {errors.username && touched.username && <Text className="text-red-500">{errors.username}</Text>}

                                    <View className="relative w-10/12 h-20 my-2 self-center">
                                        <MaterialCommunityIcons name="email" color="#396F65" size={28} className="absolute left-14 top-6 text-2xl font-bold" />
                                        <TextInput
                                            className="absolute w-full h-full text-specialGreen text-2xl font-medium border-2 border-specialGreen rounded-full pl-28 py-2"
                                            value={values.email}
                                            onChangeText={handleChange('email')}
                                            onBlur={handleBlur('email')}
                                            placeholder="Email Address"
                                            placeholderTextColor="#4C8479"
                                            keyboardType="email-address"
                                        />
                                    </View>
                                    {errors.email && touched.email && <Text className="text-red-500">{errors.email}</Text>}

                                    <View className="relative w-10/12 h-20 my-2 self-center">
                                        <FontAwesome name="phone" color="#396F65" size={28} className="absolute left-16 top-6 text-2xl font-bold" />
                                        <TextInput
                                            className="absolute w-full h-full text-specialGreen text-2xl font-medium border-2 border-specialGreen rounded-full pl-28 py-2"
                                            value={values.phoneNumber}
                                            onChangeText={handleChange('phoneNumber')}
                                            onBlur={handleBlur('phoneNumber')}
                                            placeholder="Phone Number"
                                            placeholderTextColor="#4C8479"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    {errors.phoneNumber && touched.phoneNumber && <Text className="text-red-500">{errors.phoneNumber}</Text>}

                                    <View className="relative w-10/12 h-20 my-2 self-center">
                                        <Icon name="locked" color="#396F65" size={28} className="absolute left-16 top-6 text-2xl font-bold" />
                                        <TextInput
                                            className="absolute w-full h-full text-specialGreen text-2xl font-medium border-2 border-specialGreen rounded-full pl-28 py-2"
                                            value={values.password}
                                            onChangeText={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            placeholder="Password"
                                            placeholderTextColor="#4C8479"
                                            secureTextEntry
                                        />
                                    </View>
                                    {errors.password && touched.password && <Text className="text-red-500">{errors.password}</Text>}

                                    <View className="relative w-10/12 h-20 my-2 self-center">
                                        <Icon name="locked" color="#396F65" size={28} className="absolute left-16 top-6 text-2xl font-bold" />
                                        <TextInput
                                            className="absolute w-full h-full text-specialGreen text-2xl font-medium border-2 border-specialGreen rounded-full pl-28 py-2"
                                            value={values.retypePassword}
                                            onChangeText={handleChange('retypePassword')}
                                            onBlur={handleBlur('retypePassword')}
                                            placeholder="Retype Password"
                                            placeholderTextColor="#4C8479"
                                            secureTextEntry
                                        />
                                    </View>
                                    {errors.retypePassword && touched.retypePassword && <Text className="text-red-500">{errors.retypePassword}</Text>}

                                    {/* Terms and Conditions */}
                                    <View className="flex-row justify-center items-center">
                                        <Pressable
                                            className={`flex items-center justify-center w-6 h-6 mr-2 border-2 rounded-md ${values.terms ? "bg-green-500 border-green-700" : "bg-white border-foncyGreen"}`}
                                            onPress={() => setFieldValue('terms', !values.terms)}
                                        >
                                            {values.terms && <Text className="text-white font-bold">✓</Text>}
                                        </Pressable>
                                        <Text className="text-specialGreen text-lg">I agree to the </Text>
                                        <TouchableOpacity onPress={() => router.push("/terms")}>
                                            <Text className="text-TrmesColor font-bold text-xl border-b-2 border-b-TrmesColor pb-0">Terms & Conditions</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {errors.terms && touched.terms && <Text className="text-red-500">{errors.terms}</Text>}

                                    {/* Sign Up Button */}
                                    <TouchableOpacity onPress={handleSubmit as any} className="bg-specialGreen p-6 mb-3 rounded-full w-full max-w-sm  shadow-md shadow-black mt-10">
                                        <Text className="text-white text-center text-4xl font-medium">Sign Up</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </Formik>
                    
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
