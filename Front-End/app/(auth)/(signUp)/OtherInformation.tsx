import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/Fontisto";
import AntDesign from "react-native-vector-icons/AntDesign";
import { MaterialIcons, Foundation } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import { KeyboardAvoidingView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import WilayaDropdown from "@/Component/wilayaDropDown";
import AddressDropdown from "@/Component/addressDropDown";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { LinearGradient } from "expo-linear-gradient";

export default function LocationInformation() {
  const [Age, setAge] = useState('');
  const [checkedMale, setCheckedMale] = useState(false);
  const [checkedFemale, setcheckedFemale] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");
  const navigation = useNavigation();
  const [Years, setYears] = useState("");
  const [checkedItemsWilaya, setcheckedItemsWilaya] = useState(false);
  const { width: screenWidth } = Dimensions.get("window");
  const router = useRouter();
  const [selectedWilaya, setSelectedWilaya] = useState<{
    name: string;
    id: number;
  } | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<{
    name: string;
    id: number;
  } | null>(null);

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
    const storedId = await AsyncStorage.getItem("userId");
    const id: number = Number(storedId); // Convert string to number safely

    try {
      const response = await axios.post(`${API_URL}/profile/update/user-info`, {
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

            <View className="w-full h-16 px-2 items-center justify-center bg-yellow-600 mb-1">
              <Text className="text-xl font-medium">
                you can edit it later
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
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <View className="flex-1 w-full items-center   justify-center">
                <View className="flex-1 items-center justify-center relative">
                  <WilayaDropdown
                    selectedWilaya={selectedWilaya}
                    onSelectWilaya={(wilaya) => setSelectedWilaya(wilaya)}
                  />
                  <AddressDropdown
                    selectedCity={selectedWilaya} // Pass the object, not just selectedWilaya?.name
                    onSelectMunicipality={(municipality) =>
                      setSelectedMunicipality(municipality)
                    }
                  />
                </View>

                <View className=" relative w-9/12 h-20 mt-6 mb-7 self-center ">
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
            </View>

            <View style={{ flex: 1 }} />
            <View className="w-full items-center justify-center bg-blue-600 p-6">
              <TouchableOpacity className="rounded-full w-80 h-16 bg-specialGreen items-center justify-center">
                <Text className="text-white text-3xl">Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}




