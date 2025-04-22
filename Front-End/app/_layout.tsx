import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { Linking } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const router = useRouter();
  return (
    <ThemeProvider value={ DefaultTheme}>
      <SafeAreaView style={{ flex: 1, }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} /> 
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar hidden={true} />
      </SafeAreaView>
    </ThemeProvider>
  );
}
