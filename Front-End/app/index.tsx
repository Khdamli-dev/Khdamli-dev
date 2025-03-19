  import { View, Text, Image } from "react-native";
  import React, { useEffect, useRef } from "react";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { Animated, Easing } from "react-native";
  import { useRouter } from "expo-router";

  import AsyncStorage from "@react-native-async-storage/async-storage";

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

      // التحقق من تسجيل الدخول بعد 3 ثوانٍ
     const checkLoginStatus = async () => {
       const userId = await AsyncStorage.getItem("userId");

       if (userId) {
         router.replace("./(tabs)/(home)"); // المستخدم مسجّل الدخول
       } else {
         router.replace("./(auth)"); // المستخدم غير مسجّل الدخول
       }
     };


      checkLoginStatus();
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
