import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../../../Component/SettingComponents/Header";
import PasswordInput from "../../../Component/SettingComponents/PasswordInput";
import { useRouter } from "expo-router";
import { useFonts, Itim_400Regular } from "@expo-google-fonts/itim";
import { useNavigation, NavigationProp } from "@react-navigation/native";
type RootStackParamList = {
  Setting: undefined;
};
type ChangePasswordprops = {
  navigation: NavigationProp<RootStackParamList>;
};
const ChangePassword = ({ navigation }: ChangePasswordprops) => {
  const [fontsLoaded] = useFonts({ Itim_400Regular });
  const [password, setPassword] = useState("");
  const [newpassword, setNewPassword] = useState("");
  const [repeatnewpassword, setrepeatnewpassword] = useState("");
  const [same, setsame] = useState(false);
  const router = useRouter();
  const handlePasswordChange = () => {
    {
      console.log(newpassword, repeatnewpassword, password, same);
    }
    if (!newpassword.trim() || !repeatnewpassword.trim()) {
      return Alert.alert("⚠️ Warning", "Please fill in all fields!");
    }
    if (newpassword.length < 6) {
      return Alert.alert(
        "⚠️ Warning",
        "Password must be at least 6 characters long."
      );
    }
    if (newpassword !== repeatnewpassword) {
      return Alert.alert("❌ Error", "Passwords do not match!");
    }
    if (newpassword === password) {
      return Alert.alert(
        "⚠️ Warning",
        "New password must be different from the current password."
      );
    }
    setsame(true);
    Alert.alert("✅ Success", "Password changed successfully!", [
      { text: "OK", onPress: () => router.push("/(tabs)/(settings)") },
    ]);
  };

  return (
    <SafeAreaView className="flex-1">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView keyboardDismissMode="on-drag">
            <Header />

            <View className="justify-center items-center border mx-5 rounded-lg py-5">
              <Text
                className="text-[25px]  mb-1"
                style={{ fontFamily: "Itim_400Regular" }}
              >
                Create New Password
              </Text>
              <Text className="text-[#3E3E3E] mb-2.5 ">
                Create Your New Password{" "}
              </Text>

              <PasswordInput
                label="Current Password"
                placeholder="Enter The Current Password"
                onValueChange={setPassword}
                validate={false}
              />

              <PasswordInput
                label="New Password"
                placeholder="Enter The New Password"
                onValueChange={setNewPassword}
                validate={true}
              />

              <PasswordInput
                label="Repeat New Password"
                placeholder="Repeat The New Password"
                onValueChange={setrepeatnewpassword}
              />
            </View>

            <TouchableOpacity onPress={handlePasswordChange}>
              <LinearGradient
                colors={["#4C8479", "#1E4D4D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 50 }}
                className="items-center justify-center my-5 mx-7 h-[45px] shadow-lg"
              >
                <Text
                  className="text-white  text-[20px]"
                  style={{ fontFamily: "Itim_400Regular" }}
                >
                  Save
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default ChangePassword;
