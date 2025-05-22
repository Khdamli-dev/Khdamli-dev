import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import NotificationBadge from '@/Component/NotificationBadge';
import {
  NotificationProvider,
  useNotifications,
} from '@/context/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    <View
      className={`${focused ? 'bg-white rounded-b-full' : null} items-center justify-center`}
    >
      {focused ? (
        <View className="relative w-24 h-16 justify-center rounded-b-full -top-3 items-center">
          <View className="bg-[#D9D9D9] h-12 w-12 rounded-full items-center justify-center shadow-2xl">
            <FontAwesome name={name} size={28} color="#F8A100" />
          </View>
        </View>
      ) : (
        <FontAwesome name={name} size={24} color="#DADADA" />
      )}
    </View>
  );
};

// Component that uses the notification context
const RequestsTabIcon = ({ color, focused }: { color: string; focused: boolean }) => {
  const notifications = useNotifications();

  return (
    <View className="relative w-12 h-12 items-center justify-center">
      <CustomTabBarIcon name="clipboard" color={color} focused={focused} />
      {notifications && (
        <NotificationBadge
          count={notifications.unreadPublicRequests + notifications.unreadRequests}
          size="large"
        />
      )}
    </View>
  );
};

export default function TabLayout() {
  const workerRoleId: number = 2;
  const [role, setRole] = useState<number | null>(null);

  // Load role from AsyncStorage
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          setRole(user.role); // Assuming your user object has a role
        }
      } catch (err) {
        console.error('Error fetching role:', err);
      }
    };
    fetchRole();
  }, []);

  // Define tabs content with proper context handling
  const TabsContent = () => {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#396F65',
            height: 60,
            borderTopWidth: 0,
            paddingBottom: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: -10,
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            tabBarLabel: ({ focused }) =>
              focused ? (
                <Text className="text-[#F8A100] font-medium my-1">Home</Text>
              ) : null,
            tabBarIcon: ({ color, focused }) => (
              <CustomTabBarIcon name="home" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="(search)"
          options={{
            tabBarLabel: ({ focused }) =>
              focused ? (
                <Text className="text-[#F8A100] font-medium my-1">Search</Text>
              ) : null,
            tabBarIcon: ({ color, focused }) => (
              <CustomTabBarIcon name="search" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="(requests)"
          options={{
            tabBarLabel: ({ focused }) =>
              focused ? (
                <Text className="text-[#F8A100] font-medium my-1">Requests</Text>
              ) : null,
            tabBarIcon: ({ color, focused }) => (
              <RequestsTabIcon color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="(profile)"
          options={{
            tabBarLabel: ({ focused }) =>
              focused ? (
                <Text className="text-[#F8A100] font-medium my-1">Profile</Text>
              ) : null,
            tabBarIcon: ({ color, focused }) => (
              <CustomTabBarIcon
                name="user-circle-o"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    );
  };

  // Conditionally wrap with Provider
  return workerRoleId && role === workerRoleId ? (
    <NotificationProvider>
      <TabsContent />
    </NotificationProvider>
  ) : (
    <TabsContent />
  );
}