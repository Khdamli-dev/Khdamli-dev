import { View } from "react-native";
import React, { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import apiClient from "@/api/appClient";
import refreshAccessToken from "@/api/refreshAccessToken";

const AppStartUp = () => {
  const router = useRouter();

  const leftAnim = useRef(new Animated.Value(-200)).current;
  const rightAnim = useRef(new Animated.Value(200)).current;
  const imageAnim = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    // تشغيل الأنيميشن
    Animated.parallel([
      Animated.timing(leftAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(rightAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(imageAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      router.replace("/(tabs)/(home)");
    }, 1500);

    // التحقق من تسجيل الدخول بعد 3 ثوانٍ
    /* const checkLoginStatus = async () => {
      
      // refresh the access token
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (!refreshToken) {
        router.replace("/(auth)");
        return;
      }

      try {
        const response = await apiClient.post("/auth/refresh", null, {
          headers: {
            "x-refresh-token": `Bearer ${refreshToken}`,
          },
        });
        if (response.data.success) {
          const { accessToken }: { accessToken: string } = response.data;
          await SecureStore.setItemAsync("accessToken", accessToken);
          router.replace("/(tabs)/(home)");
        } else router.replace("/(auth)");
      } catch (error) {
        router.replace("/(auth)");
      }
    };

      checkLoginStatus();  */
  }, []);

  return (
    <SafeAreaView className="bg-specialGreen flex-1">
      <View className="flex-1 justify-center items-center">
        <View className="flex-row items-end ">
          <Animated.Text
            className="text-9xl tracking-tight pt-8  text-foncyYellow uppercase font-bold"
            style={{
              transform: [{ translateX: leftAnim }],
            }}
          >
            KH
          </Animated.Text>
          <View className=" items-end flex-col">
            <Animated.Image
              source={require("../assets/images/startUpPhoto.jpg")}
              className="w-full h-32"
              style={{
                transform: [{ translateX: imageAnim }],
              }}
            />
            <Animated.Text
              className="text-7xl pt-2 pb-2 tracking-widest text-bl lowercase font-bold"
              style={{
                transform: [{ translateX: rightAnim }],
              }}
            >
              damli
            </Animated.Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AppStartUp;
