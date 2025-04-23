import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CONFIG from "@/config";
import axios from "axios";
import { router, useRouter } from "expo-router";

import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  Phone,
  Mail,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Trash2,
} from "lucide-react-native";
import { ScrollView } from "react-native";

declare module "lucide-react-native" {
  export interface LucideProps {
    color?: string;
  }
}

type RootStackParamList = {
  changephone: undefined;
  changeEmail: undefined;
  ChangePassword: undefined;
  ContactUs: undefined;
  Help: undefined;
};

const profileOptions = [
  { label: "Change Phone", Icon: Phone, navigateTo: "changephone" },
  { label: "Change Email", Icon: Mail, navigateTo: "changeEmail" },
  {
    label: "Change Password",
    Icon: Lock,
    navigateTo: "ChangePassword",
  },
  { label: "Contact Us", Icon: Phone, navigateTo: "ContactUs" },
  { label: "Help", Icon: HelpCircle, navigateTo: "Help" },
  { label: "Log Out", Icon: LogOut },
];

interface ProfileItemProps {
  label: string;
  value?: React.ReactNode;
  Icon?: React.FC<{ size: number; color: string }>;
  textcolor?: string;
  padding?: number;
  navigateTo?: keyof RootStackParamList | undefined;
  onPress?: () => void;
}

const ProfileItem: React.FC<ProfileItemProps> = ({
  label,
  value,
  Icon,
  textcolor,
  padding = 16,
  navigateTo,
  onPress,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity
      style={{ paddingVertical: padding }}
      className="flex-row justify-between items-center mb-1"
      onPress={onPress ?? (() => navigateTo && navigation.navigate(navigateTo))}
    >
      <View className="flex-row items-center gap-2.5">
        {Icon && <Icon size={20} color="#BD7D06" />}
        <Text
          style={{ fontFamily: "Itim_400Regular", color: textcolor }}
          className="text-[16px] ml-2"
        >
          {label}
        </Text>
      </View>
      <View>{value}</View>
    </TouchableOpacity>
  );
};

const Setting = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      console.log("AsyncStorage has been cleared.");
      // Navigate back to the auth screen and reset history
      router.replace("/(auth)");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  const handledelete = async () => {
    const userData = await AsyncStorage.getItem("user");

    if (userData) {
      const user: any = JSON.parse(userData);
      try {
        const response = await axios.delete(
          `${CONFIG.API_URL}/users/${user.id}`
        );
        if (response.data.success) {
          await AsyncStorage.removeItem("user");
          Alert.alert("Success", "Your account has been deleted.");
          router.replace("/(auth)");
        }
      } catch (error) {
        Alert.alert("Error", "Server is busy, please try again later.");
      }
    } else {
      console.log("No user data found in AsyncStorage " + userData);
      Alert.alert("Error", "No user data found.");
    }
  };

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  return (
      <ScrollView className="flex-1 p-2"> 
        <View className="px-2 py-1  bg-white rounded-2xl mb-2 mx-2 p-4 border border-gray-300 shadow-md">
          <ProfileItem
            label="Active Account"
            padding={0}
            value={
              <Switch
                trackColor={{ false: "#767577", true: "#4CAF50" }}
                thumbColor={isEnabled ? "#396F65" : "#ccc"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
                style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
              />
            }
          />
        </View>
        <Text
          className="text-lg mt-5 mb-3 px-5"
          style={{ fontSize: 19, fontFamily: "Itim_400Regular" }}
        >
          Account Setting
        </Text>

        <View className="bg-white rounded-2xl mb-2 mx-2 p-4 border border-gray-300 shadow-md">
          {profileOptions
            .filter((item) =>
              ["Change Phone", "Change Email", "Change Password"].includes(
                item.label
              )
            )
            .map((item, index) => (
              <ProfileItem
                key={index}
                label={item.label}
                Icon={(props) => (
                  <item.Icon
                    {...props}
                    size={props.size ? Number(props.size) : 20}
                  />
                )}
                value={<ChevronRight size={20} color="#BD7D06" />}
                navigateTo={item.navigateTo as keyof RootStackParamList}
              />
            ))}
        </View>
        <Text
          className="text-[19px]  mt-5 mb-3 px-5 "
          style={{ fontFamily: "Itim_400Regular" }}
        >
          Customer Service{" "}
        </Text>
        <View className="bg-white rounded-2xl mb-2 mx-2 p-4 border border-gray-300 shadow-md">
          {profileOptions
            .filter(
              (item) =>
                item.label === "Contact Us" ||
                item.label === "Help" ||
                item.label === "Log Out"
            )
            .map((item, index) => (
              <ProfileItem
                key={index}
                label={item.label}
                Icon={(props) => (
                  <item.Icon
                    {...props}
                    size={props.size ? Number(props.size) : 20}
                  />
                )}
                value={<ChevronRight size={20} color="#BD7D06" />}
                navigateTo={
                  item.label === "Log Out"
                    ? undefined
                    : (item.navigateTo as keyof RootStackParamList)
                }
                onPress={item.label === "Log Out" ? handleLogout : undefined}
              />
            ))}
        </View>
        <View className="bg-red-600 rounded-2xl mb-2 mx-2 p-4 border border-gray-300 shadow-md py-0 ">
          <ProfileItem
            label="Delete Account "
            value={<Trash2 size={20} color="white" />}
            textcolor="white"
            onPress={handledelete}
          />
        </View>
      </ScrollView>
  );
};

export default Setting;
