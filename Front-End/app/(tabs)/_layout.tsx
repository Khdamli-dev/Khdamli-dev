import { Tabs } from "expo-router";
import React from "react";
import { View, Text, Platform } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import WorkerComments from "./(requests)/(comment)/WorkerComments";
const CustomTabBarIcon = ({
  name,
  focused,
}: {
  name: any;
  focused: boolean;
}) => {
  return (
    <View className="items-center justify-center">
      {focused ? (
        <View className="relative w-20 h-16 justify-center items-center">
          <View className="absolute -top-5 w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg">
            <View className="bg-[#D9D9D9] h-12 w-12 rounded-full items-center justify-center">
              <FontAwesome name={name} size={24} color="#F8A100" />
            </View>
          </View>
        </View>
      ) : (
        <View className="py-3">
          <FontAwesome name={name} size={24} color="#DADADA" />
        </View>
      )}
    </View>
  );
};

const RequestNotification = ({
  badgcount,
  focused,
}: {
  badgcount: number;
  focused: Boolean;
}) => {
  if (badgcount <= 0) return null; // Hide when there's no badge count

  return (
    <View
      className={`bg-red-700 rounded-full h-5 w-5 items-center justify-center absolute ${
        focused ? "top-[-32] right-4" : "top-[-9] right-[-8]"
      }`}
    >
      <Text className="text-white text-xs font-bold">{badgcount}</Text>
    </View>
  );
};
export default function TabLayout() {
  const bottomInset = Platform.OS === "ios" ? 8 : 4;
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#396F65",
          height: 60 + bottomInset,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          paddingBottom: bottomInset,
        },
        tabBarActiveTintColor: "#F8A100",
        tabBarInactiveTintColor: "#DADADA",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarLabel: ({ focused }) => 
            focused ? <Text className="text-[#F8A100] font-medium">Home</Text> : null,
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(search)"
        options={{
          tabBarLabel: ({ focused }) => 
            focused ? <Text className="text-[#F8A100] font-medium">Search</Text> : null,
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon name="search" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(requests)"
        options={{
          tabBarLabel: ({ focused }) => 
            focused ? <Text className="text-[#F8A100] font-medium">Requests</Text> : null,
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon name="clipboard" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          tabBarLabel: ({ focused }) => 
            focused ? <Text className="text-[#F8A100] font-medium">Profile</Text> : null,
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon name="user-circle-o" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
