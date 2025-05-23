import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
const Header: React.FC = () => {
  const router = useRouter();
  return (
    <View className="flex-row items-center justify-center py-10 pb-5 px-5 mt-9">
      <TouchableOpacity onPress={() => router.push("/(tabs)/(profile)/(settings)")}>
        <ArrowLeft size={38} color="black" />
      </TouchableOpacity>

      <View className="flex-row justify-center items-center flex-1">
        <Text className="text-5xl text-[#F8A100] mr-1 tracking-wider">Kh</Text>
        <Text className="text-4xl text-[#4C8479] mt-1">damli</Text>
      </View>
    </View>
  );
};

export default Header;
