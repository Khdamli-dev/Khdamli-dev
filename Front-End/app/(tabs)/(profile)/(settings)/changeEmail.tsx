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
import { useFonts, Itim_400Regular } from "@expo-google-fonts/itim";
import { NavigationProp } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@/api/appClient";

type RootStackParamList = {
  Setting: undefined;
};
type ChangeEmailProps = {
  navigation: NavigationProp<RootStackParamList>;
};

const ChangeEmail = ({ navigation }: ChangeEmailProps) => {
  const [email, setEmail] = useState<string>("");
  const router = useRouter();

  let [fontsLoaded] = useFonts({ Itim_400Regular });
  if (!fontsLoaded) return null;

  const handleEmailChange = async() => {
    if (!email.trim()) {
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
        credentials :{email}
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert("✅ Success", "Email changed successfully!");
        router.push("/(tabs)/(profile)/(settings)");
      } else {
        Alert.alert("❌ Error", "Failed to change email.");
      }
    } catch (error: any) {
      console.error("Email change error:", error?.response?.data || error);
      Alert.alert("❌ Error", "An error occurred while changing email.");
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
          Change Your Email
        </Text>
        <PasswordInput
          label="New Email"
          placeholder="Enter The New Email"
          onValueChange={setEmail}
          input="email"
        />
      </View>
      <TouchableOpacity onPress={handleEmailChange}>
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

export default ChangeEmail;
