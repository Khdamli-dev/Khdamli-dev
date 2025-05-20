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

type RootStackParamList = {
  Setting: undefined;
};
type ChangePhoneprops = {
  navigation: NavigationProp<RootStackParamList>;
};
const changephone = ({ navigation }: ChangePhoneprops) => {
  const [phone, setPhone] = useState<string>("");
  const handlePhoneChange = () => {

    if (!phone.trim())
      return Alert.alert("⚠️ Warning", "Please fill in field!");
    navigation.navigate("Setting");
    Alert.alert("✅ Success", "Password changed successfully!");
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
