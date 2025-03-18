import { Tabs } from "expo-router";
import React from "react";
import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const CustomTabBarIcon = ({
  name,
  color,
  focused,
}: {
  name: any;
  color: string;
  focused: boolean;
}) => {
  return (
    <View className="items-center justify-center">
      {focused ? (
        <View className="relative bg-white w-24 h-16 justify-center rounded-b-full -top-3 items-center">
          <View className="bg-[#D9D9D9] h-12 w-12 rounded-full items-center justify-center shadow-2xl">
            <FontAwesome name={name} size={24} color="#F8A100" />
          </View>
        </View>
      ) : (
        <FontAwesome name={name} size={24} color="#DADADA" />
      )}
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#396F65",
          height: 60, // Increased height to accommodate the design
          borderTopWidth: 0,
          paddingBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: -10, // Adjust label position
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              className={`${
                focused ? "text-[#F8A100]" : "text-specialGreen"
              } font-medium`}
            >
              Home
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <CustomTabBarIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="requeste"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              className={`${
                focused ? "text-[#F8A100]" : "text-specialGreen"
              } font-medium`}
            >
              Requests
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <CustomTabBarIcon
              name="clipboard"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              className={`${
                focused ? "text-[#F8A100]" : "text-specialGreen"
              } font-medium`}
            >
              Profile
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <CustomTabBarIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              className={`${
                focused ? "text-[#F8A100]" : "text-specialGreen"
              } font-medium`}
            >
              Settings
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <CustomTabBarIcon name="cog" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}