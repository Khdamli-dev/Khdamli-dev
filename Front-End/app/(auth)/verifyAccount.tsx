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
  ActivityIndicator,
} from "react-native";
import Fontisto from "react-native-vector-icons/Fontisto";
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import AntDesign from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import CONFIG from "@/config";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import apiClient from "@/api/appClient";
const setUserVerificationStatus = async (isVerified : boolean) => {
  try {
    await AsyncStorage.setItem('userVerified', isVerified ? 'true' : 'false');
  } catch (error) {
    console.error('Error saving verification status:', error);
  }
};

export default function VerficationCode() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const params = useLocalSearchParams();
  const shouldSendEmailOnMount = params.sendEmail === 'true';

  //Code schema
  const CELL_COUNT = 6;
 
  const [code, setCode] = useState('');
  const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({ 
    value: code,
    setValue: setCode, 
  });
  const [Error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inValidCode, setInValidCode] = useState("");
  const [resendCode, setResendCode] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const [initialCodeSent, setInitialCodeSent] = useState(false);

  const handleTextChange = (text : string) => {
    if (/^\d*$/.test(text)) {
      setCode(text);
      setError('');
      setInValidCode("");
      setIsCodeExpired(false);
    } else {
      setError("Please enter only numbers");
    }
  };
      
  const router = useRouter();

  //handleVerification
  const handleVerification = async () => {
    if (code.length !== CELL_COUNT) {
      setInValidCode("Please enter the complete verification code");
      return;
    }

    setIsLoading(true);
    const {id} = JSON.parse(await AsyncStorage.getItem("user") || '');
    
    try {
      const response = await apiClient.post(
        `/auth/signup/confirm-email/${id}`, 
          {otp: code}
      );

      if (response.status === 200) {
        await setUserVerificationStatus(true);
        // On success, navigate to home page
        router.replace("/(tabs)/(home)");
      }
    } catch (error : any) {
      console.error("Verification error:", error.response.data || error);
      if (error.response) {
        if (error.response.status === 400) {
          if (error.response.data.resend) {
            setInValidCode("Code has expired");
            setIsCodeExpired(true);
          } else {
            setInValidCode("Invalid Code");
          }
        } else if (error.response.status === 500) {
          setInValidCode("Internal server error");
        }
      } else {
        setInValidCode("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  //Resend Code
  const [timer, setTimer] = useState(60); // Start with 60 seconds

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Send initial verification code on component mount if needed
  useEffect(() => {
    const sendInitialCode = async () => {
      if (initialCodeSent) return;
      
      try {
        const userData = await AsyncStorage.getItem("user");
        if (!userData) {
          console.error("No user data found");
          return;
        }
        
        const user = JSON.parse(userData);
        const { id, email } = user;
        
        if (!id || !email) {
          console.error("Missing user ID or email");
          return;
        }
        
        setIsLoading(true);

        const response = await apiClient.post(
          `/auth/signup/resend-email/${id}`, {
            credentials: { email }
          }
        );
        
        if (response.status === 200) {
          setInitialCodeSent(true);
          setResendSuccess(true);
          setResendCode("Verification code sent to your email");
          setTimer(60); // Reset timer to 60 seconds
        }
      } catch (error : any) {
        if (error.response.status === 400 && error.response.data.message === 'you already confirm you email') {
          await setUserVerificationStatus(true);
          router.replace("/(tabs)/(home)");
          return
        }
        console.error("Failed to send initial verification code:", error);
        setResendSuccess(false);
        setResendCode("Failed to send verification code");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (shouldSendEmailOnMount) {
      sendInitialCode();
    }
  }, []);

  const handleResendCode = async () => {
    if (timer > 0 && !isCodeExpired) return;
    
    setIsLoading(true);
    setResendCode("");
    setIsCodeExpired(false);
    
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        setError("No user data found");
      }
      
      const user = JSON.parse(userData || '');
      const { id, email } = user;
      
      if (!id || !email) {
        setError("Missing user ID or email");
      }
      
      const response = await apiClient.post(
        `/auth/signup/resend-email/${id}`, {
          credentials: {email}
        }
      );

      if (response.status === 200) {
        setResendSuccess(true);
        setResendCode("Code sent successfully");
        setTimer(60); // Reset timer to 60 seconds
        setCode(''); // Clear the input field
        setInValidCode(''); // Clear any error messages
      }
    } catch (error : any) {
      if (error.response.status === 400 && error.response.data.message === 'you already confirm you email') {
          await setUserVerificationStatus(true);
          router.replace("/(tabs)/(home)");
       }
      console.error("Resend code error:", error?.response?.data || error);
      setResendSuccess(false);
      setResendCode("Failed to send code");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-200 justify-center items-center">
        <ActivityIndicator size="large" color="#4C8479" />
        <Text className="mt-4 text-specialGreen text-lg">Processing...</Text>
      </SafeAreaView>
    );
  }

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

          {/* Icon && Text Section */}
          <View className="flex justify-center items-center">
            <View className="relative w-full h-56 flex items-center justify-center ">
              <Fontisto name="key" color="#4C8479" size={100} />
            </View>
            
            <Text className="font-medium text-4xl w-11/12 text-center leading-10 pb-2">
              Please Enter
              The Code That Was Sent
            </Text>
          </View>
         
        
          <View className="relative w-full h-32 flex items-center justify-center">
            <CodeField
              ref={ref}
              {...props}
              value={code}
              onChangeText={handleTextChange}
              cellCount={CELL_COUNT}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({ index, symbol, isFocused }) => (
                <View
                  key={index}
                  className={`border-2 mx-1 rounded-xl ${
                    symbol ? 'border-specialGreen' : isFocused ? 'border-specialGreen' : inValidCode ? "border-red-600" : 'border-black'
                  } w-10 h-12 flex items-center justify-center`}
                  onLayout={getCellOnLayoutHandler(index)}
                >
                  <Text className="text-2xl text-center text-foncyYellow">
                    {symbol || (isFocused ? '•' : '')}
                  </Text>
                </View>
              )}
            />
            {Error ? <Text className="text-center text-red-600 text-lg w-9/12">{Error}</Text> : null}
            {inValidCode ? <Text className="text-center text-red-600 text-lg w-9/12">{inValidCode}</Text> : null}
          </View>

          {/* Expired Code Resend Button */}
          {isCodeExpired && (
            <View className="w-full flex items-center justify-center mb-4">
              <TouchableOpacity
                onPress={handleResendCode}
                className="bg-red-500 p-3 rounded-full max-w-96 shadow-md shadow-black w-11/12"
              >
                <Text className="text-white text-center text-xl">
                  Resend Expired Code
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="relative w-full h-48 flex items-center justify-center">
            <TouchableOpacity
              onPress={handleVerification}
              className="bg-specialGreen p-4 rounded-full max-w-96 shadow-md shadow-black w-11/12"
            >
              <Text className="text-white text-center font text-3xl lg:text-xl">
                Confirm
              </Text>
            </TouchableOpacity>
            <View
              style={{ flexDirection: "row", alignItems: "center" }}
              className="pt-4"
            >
              <Text style={{ color: "#8F8F8F" }}>Didn't Receive Code? </Text>
              <TouchableOpacity onPress={handleResendCode} disabled={timer > 0 && !isCodeExpired}>
                <Text
                  style={{
                    color: timer > 0 && !isCodeExpired ? "#ff0000" : "#000",
                    fontWeight: "bold",
                  }}
                  className=""
                >
                  {timer > 0 && !isCodeExpired ? ` RESEND IN ${timer}s` : " RESEND NOW"}
                </Text>
              </TouchableOpacity>
            </View>
            {resendCode ? (
              <Text className={`text-center ${resendSuccess ? "text-specialGreen" : "text-red-600"} text-lg w-9/12 mt-2`}>
                {resendCode}
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}