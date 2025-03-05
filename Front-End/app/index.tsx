import { View, Text } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

const AppStartUp = () => {
  const router = useRouter();

  const leftAnim = useRef(new Animated.Value(-200)).current;
  const rightAnim = useRef(new Animated.Value(200)).current;

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
    ]).start();

    // التحقق من تسجيل الدخول بعد 3 ثوانٍ
    const checkLoginStatus = async () => {
      /*  const userToken = await AsyncStorage.getItem("userToken");
       */
      setTimeout(() => {
        if (true) {
          router.push('./(auth)'); // الانتقال إلى الصفحة الرئيسية
        } else {
          router.replace('./(tabs)'); // الانتقال إلى صفحة تسجيل الدخول
        }
      }, 3000);
    };

    checkLoginStatus();
  }, []);

  return (
    <SafeAreaView className="bg-specialGreen flex-1">
      <View className="flex-1 justify-center items-center">
        <View className="flex-row items-baseline">
          <Animated.Text
            className="text-9xl tracking-tight text-foncyYellow uppercase font-bold"
            style={{
              transform: [{ translateX: leftAnim }],
            }}
          >
            KH
          </Animated.Text>
          <Animated.Text
            className="text-7xl tracking-widest text-bl lowercase font-bold "
            style={{
              transform: [{ translateX: rightAnim }],
            }}
          >
            damli
          </Animated.Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AppStartUp;
