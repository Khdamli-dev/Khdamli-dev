import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Foundation, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CONFIG from "../../../config";
import { KeyboardAvoidingView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import WilayaDropdown from "@/Component/wilayaDropDown";
import AddressDropdown from "@/Component/addressDropDown";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import apiClient from "@/api/appClient";

export default function OtherInformation() {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const router = useRouter();
  const rotateAnim = useState(new Animated.Value(0))[0];

  const [selectedWilaya, setSelectedWilaya] = useState<{
    name: string;
    id: number;
  } | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<{
    name: string;
    id: number;
  } | null>(null);
  const [ageFocusedInput, setAgeFocusedInput] = useState<string | null>(null);
  //Creat validationSchema
  const validationSchema = Yup.object().shape({
    age: Yup.number()
      .min(18, "You must be at least 18 years old")
      .max(100, "Age cannot be more than 100 years old"),
    sex: Yup.number(),
  });
  //WilayaDropDown
  const [isWilayaOpen, setIsWilayaOpen] = useState(false);
  const toggleDropdown = () => {
    setIsWilayaOpen(!isWilayaOpen);
    isAddressOpen ? setIsAddressOpen(!isAddressOpen) : null;
  };
  useEffect(() => {
    setSelectedMunicipality(null);
  }, [selectedWilaya]);

  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const toggleAddressDropdown = () => {
    setIsAddressOpen(!isAddressOpen);
    isWilayaOpen ? setIsWilayaOpen(!isWilayaOpen) : null;
  };
  const handleSelectedMunicipality = (municipalitie: any) => {
    setSelectedMunicipality(municipalitie);
    setIsAddressOpen(false);
  };
  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  // handleOtherInfermation
  const handleOtherInfermation = async ({
    age,
    sex,
    region,
    city,
  }: {
    age: number | undefined;
    sex: number | undefined;
    region: number | undefined;
    city: number | undefined;
  }) => {
    const address = region
      ? {
          region,
          city,
        }
      : null;
    const personalInfo = {
      age: age ? age : null,
      sex: sex ? sex : null,
      address,
    };

    // Retrieve userId from AsyncStorage
    const userData = await AsyncStorage.getItem("user");

    if (userData) {
      const user: any = JSON.parse(userData); // Parse only if userData is not null
      try {
        const response = await apiClient.put(`/users/${user.id}`, {
          personalInfo, // Pass the user ID
        });
        if (response.data.success) {
          router.replace("/selectionRole");
        }
      } catch (error) {
        alert("Server is busy, please try again later.");
      }
    } else {
      console.log("No user data found in AsyncStorage " + userData);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
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
            <View className=" w-full h-20  flex-row justify-end items-center pr-6 ">
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
                className=" text-5xl  font-semibold text-white"
              >
                Information
              </Text>
            </View>
          </LinearGradient>

          <Formik
            initialValues={{ age: "", sex: 0 }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              handleOtherInfermation({
                age: Number(values.age),
                sex: values.sex,
                region: selectedWilaya?.id,
                city: selectedMunicipality?.id,
              });
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
              setFieldValue,
            }) => (
              <View className="flex-1 w-full items-center   justify-center">
                <View className="flex-1 items-center justify-center w-full">
                  <TouchableOpacity
                    className="flex-row items-center justify-between w-9/12 h-20 border-2 border-specialGreen rounded-full px-4"
                    onPress={toggleDropdown}
                  >
                    <MaterialIcons
                      name="location-pin"
                      color="#396F65"
                      size={30}
                    />
                    <Text className="text-xl text-specialGreen font-bold">
                      {selectedWilaya?.name || "Enter your Wilaya"}
                    </Text>
                    <MaterialIcons
                      name={
                        isWilayaOpen
                          ? "keyboard-arrow-up"
                          : "keyboard-arrow-down"
                      }
                      color="#4C8479"
                      size={30}
                    />
                  </TouchableOpacity>
                  {isWilayaOpen && (
                    <WilayaDropdown
                      selectedWilaya={selectedWilaya}
                      onSelectWilaya={(wilaya) => {
                        setSelectedWilaya(wilaya);
                        setIsWilayaOpen(false);
                      }}
                    />
                  )}
                </View>
                <View className="flex-1 items-center mt-5 justify-center w-full">
                  <TouchableOpacity
                    className="flex-row items-center justify-between w-9/12 h-20 border-2 border-specialGreen rounded-full px-4 bg-white shadow-md"
                    onPress={toggleAddressDropdown}
                  >
                    <MaterialIcons
                      name="location-city"
                      color="#396F65"
                      size={30}
                    />
                    <Text className="text-xl text-specialGreen font-bold">
                      {selectedMunicipality?.name || "Enter your City"}
                    </Text>
                    <MaterialIcons
                      name={
                        isAddressOpen
                          ? "keyboard-arrow-up"
                          : "keyboard-arrow-down"
                      }
                      color="#4C8479"
                      size={30}
                    />
                  </TouchableOpacity>
                  {isAddressOpen && selectedWilaya && (
                    <AddressDropdown
                      selectedCity={selectedMunicipality} // Pass the object, not just selectedWilaya?.name
                      onSelectMunicipality={(municipality) =>
                        handleSelectedMunicipality(municipality)
                      }
                      wilaya={selectedWilaya}
                    />
                  )}
                </View>

                <View className=" relative w-9/12 h-20 mt-6 mb-7 self-center ">
                  {ageFocusedInput !== "age" && (
                    <AntDesign
                      name="idcard"
                      color="#ffffff"
                      size={28}
                      className="bg-specialGreen absolute left-6 top-6  text-2xl font-bold "
                    />
                  )}
                  <TextInput
                    className={` ${
                      ageFocusedInput === "age" ? "px-10" : "pl-16"
                    } absolute w-full h-full  text-xl font-bold border-2 ${errors.age && touched.age ? "border-red-600" : "border-specialGreen"} rounded-full  py-2`}
                    value={values.age}
                    onChangeText={handleChange("age")}
                    onBlur={() => {
                      if (values.age === "") {
                        setAgeFocusedInput(null);
                      }
                      handleBlur("age");
                    }}
                    onFocus={() => {
                      setAgeFocusedInput("age");

                      setFieldTouched("age", false);
                    }}
                    keyboardType="numeric"
                    inputMode="numeric"
                    placeholder="Enter Your Age +18"
                    placeholderTextColor="#4C8479"
                    scrollEnabled
                  />
                </View>
                {touched.age && errors.age && (
                  <Text className="text-center text-red-600 text-lg  w-9/12">
                    {errors.age}
                  </Text>
                )}

                <View className="flex-row  w-10/12 pb-4 pt-2 items-center justify-between ">
                  <View className="flex-col  ">
                    <TouchableOpacity
                      onPress={() => setFieldValue("sex", 2)}
                      className={`${
                        values.sex === 2 ? "bg-specialGreen" : "bg-white"
                      } rounded-full w-40 h-40 border-2 border-specialGreen items-center justify-center mb-3 `}
                    >
                      <Foundation
                        name="female-symbol"
                        color="#F8A100"
                        size={70}
                      />
                    </TouchableOpacity>
                    <View className="items-center justify-center">
                      <Text className="text-2xl text-black font-medium">
                        Female
                      </Text>
                    </View>
                  </View>
                  <View className="flex-col ">
                    <TouchableOpacity
                      onPress={() => setFieldValue("sex", 1)}
                      className={`${
                        values.sex === 1 ? "bg-specialGreen" : "bg-white"
                      } rounded-full w-40 h-40 border-2 border-specialGreen items-center justify-center mb-3 `}
                    >
                      <Foundation
                        name="male-symbol"
                        color="#F8A100"
                        size={70}
                      />
                    </TouchableOpacity>
                    <View className="items-center justify-center ">
                      <Text className="text-2xl text-black font-medium">
                        Male
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={{ flex: 1 }} />

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
