import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import Header from "../../../Component/SettingComponents/Header";
import { LinearGradient } from "expo-linear-gradient";
import PasswordInput from "../../../Component/SettingComponents/PasswordInput";
import { useFonts, Itim_400Regular } from "@expo-google-fonts/itim";
import { NavigationProp } from "@react-navigation/native";
import { useRouter } from "expo-router";

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

  const handleEmailChange = () => {
    if (!email.trim()) {
      Alert.alert("⚠️ Warning", "Please fill in the field!");
      return;
    }

    Alert.alert("✅ Success", "Email changed successfully!", [
      {
        text: "OK",
        onPress: () => router.push("/(tabs)/(settings)"),
      },
    ]);
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
