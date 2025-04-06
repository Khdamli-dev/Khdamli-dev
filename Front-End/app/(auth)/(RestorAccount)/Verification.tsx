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
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import AntDesign from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import CONFIG from "../../../config"
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";

export default function VerficationCode() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  //Code schema
  const CELL_COUNT = 6;
 
    const [code, setCode] = useState('');
    const ref = useBlurOnFulfill({  value: code, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value: code,
      setValue: setCode, });
      const [Error, setError] = useState('');

      const handleTextChange = (text: any) => {
       
        if (/^\d*$/.test(text)) {
          setCode(text);
          setError('');
          setInValidCode("");
        } else {
          setError("Please enter only numbers");
        }
      };
      
 
  
  const router = useRouter();

  //handleVerification
  const [ inValidCode, setInValidCode ] = useState("");

  const handleVerification = async () => {
    const storedId = await AsyncStorage.getItem("userId");
    const id: number = Number(storedId); // Convert string to number safely
    try {
      const response = await axios.post(
        `${CONFIG.API_URL}/auth/password-reset/verify`,
        {
          otp: code,
          id,
        }
      );

      if (response.status === 200) {
        router.replace("./newPassword");
        setInValidCode("")
      } else {
        
      }
    } catch (error : any) {
      if (error.status === 400 && !error.resend){
        setInValidCode("Invalid Code");
      }
      else if (error.status === 400 && error.resend){
        setInValidCode("Code has expired")
      }
      else if(error.status === 500){
        setInValidCode("Internal server error")
      }
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

  const [ resendCode, setresendCode ] = useState("");
  const [ resendSuccess, setresendSuccess ] = useState(false);


  const handelResendCode = async () => {
    if (timer > 0) return;
    const { email } = useLocalSearchParams(); //Get the Email
    try {
      await axios.post(`${CONFIG.API_URL}/auth/password-reset/request`,
         { credentials: { email: email} });
         setresendSuccess(true)
         setresendCode("Code sent successfully!");
      setTimer(120);
    } catch (error) {
      setresendCode("Failed to resend code");
      setresendSuccess(false)
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

          {/* Icon && Text Section */}
          <View className="flex justify-center items-center">
          <View className="relative w-full  h-56 flex items-center justify-center ">
            <Fontisto name="key" color="#4C8479" size={100} />
          </View>
          
            <Text className="font-medium text-4xl w-11/12 text-center  leading-10 pb-2">
              Please Enter
              The Code That Was Sent
            </Text>
          </View>
         
        
          <View className="relative w-full  h-32 flex items-center justify-center   ">
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
                  symbol ? 'border-specialGreen' : isFocused ? 'border-specialGreen' : inValidCode ? "border-red-600": 'border-black'
                } w-10 h-12 flex items-center justify-center`}

                onLayout={getCellOnLayoutHandler(index)}
            >
                  <Text  className="text-2xl text-center text-foncyYellow">
                  {symbol || (isFocused ? '•' : '')}
                  </Text>
                 
              </View>
    )}
/>
      {Error ? <Text className="text-center text-red-600 text-lg  w-9/12">{Error}</Text> : null}
      {inValidCode ? <Text className="text-center text-red-600 text-lg  w-9/12">{inValidCode}</Text> : null}

          
          </View>

          <View className="relative w-full  h-48 flex items-center justify-center    ">
            <TouchableOpacity
              onPress={handleVerification}
              className="bg-specialGreen p-4 rounded-full  max-w-96 shadow-md shadow-black w-11/12 "
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
              <TouchableOpacity onPress={()=>router.push("/newPassword")} disabled={timer > 0}>
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
              {resendCode ? (
                <Text className={`text-center ${resendSuccess? "text-specialGreen": "text-red-600"}  text-lg  w-9/12 `}>{resendCode}</Text>
               ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}