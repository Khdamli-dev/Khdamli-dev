import React from "react";
import { View, Text, Button } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const logout = async () => {
  try {
    await AsyncStorage.clear();
    console.log("AsyncStorage has been cleared.");
    // Navigate back to the auth screen and reset history
    router.replace("/(auth)");
  } catch (error) {
    console.error("Error clearing AsyncStorage:", error);
  }
};



const SettingsScreen = () => {
  return (
    <View className="flex-1 items-center bg-white justify-center">
      <Text>Settings Screen</Text>
      <Button title="Logout" onPress={logout} color="red" />
    </View>
  );
};

export default SettingsScreen;
