import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import Header from "@/Component/SettingComponents/Header";
import { LinearGradient } from "expo-linear-gradient";
import PasswordInput from "@/Component/SettingComponents/PasswordInput";
import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@/api/appClient"; // Adjust the import based on your project structure
import { router } from "expo-router";

type RootStackParamList = {
  Setting: undefined;
};
type ChangePhoneprops = {
  navigation: NavigationProp<RootStackParamList>;
};
const changephone = ({ navigation }: ChangePhoneprops) => {
  const [phone, setPhone] = useState<string>("");
  const handlePhoneChange = async () => {
    if (!phone.trim()) {
      return Alert.alert("⚠️ Warning", "Please fill in field!");
    }

    try {
      // Get user ID from AsyncStorage (or your preferred method)
      const userData = await AsyncStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      if (!user?.id) {
        return Alert.alert("Error", "User not found.");
      }

      // Make API call to update phone number
      const response = await apiClient.put(`/users/${user.id}`, {
        credentials :{phoneNumber :phone}
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert("✅ Success", "Phone number changed successfully!");
        router.push("/(tabs)/(profile)/(settings)");
      } else {
        Alert.alert("❌ Error", "Failed to change phone number.");
      }
    } catch (error: any) {
      console.error("Phone change error:", error?.response?.data || error);
      Alert.alert("❌ Error", "An error occurred while changing phone number.");
    }
  };
  return (
    <SafeAreaView>
      <Header />
      <View className="justify-center items-center border mx-5 rounded-lg py-5">
        <Text
          className="text-[25px] mb-1"
          style={{ fontFamily: "Itim_400Regular" }}
        >
          {" "}
          Change Your Phone{" "}
        </Text>
        <PasswordInput
          label="New Phone"
          placeholder="Enter The New Phone"
          onValueChange={setPhone}
          input="phone"
        />
      </View>
      <TouchableOpacity onPress={handlePhoneChange}>
        <LinearGradient
          colors={["#4C8479", "#1E4D4D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 50 }}
          className="items-center justify-center my-5 mx-7 h-[45px] shadow-lg"
        >
          <Text
            className="text-white text-[20px]"
            style={{ fontFamily: "Itim_400Regular" }}
          >
            Save
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default changephone;
