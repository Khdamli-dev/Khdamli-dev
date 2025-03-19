import React from "react";
import { View, Text ,Button } from "react-native";
import { router } from "expo-router";
const HomeScreen = () => {
  return (
    <View className="flex-1 items-center bg-white justify-center">
      <Text>Home Screen</Text>
      <Button title="+Request" onPress={()=>router.push("/(tabs)/(home)/requeste")} color="red" />
    </View>
  );
};

export default HomeScreen;
