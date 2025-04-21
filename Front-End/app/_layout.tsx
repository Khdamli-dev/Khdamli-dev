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
  useEffect(() => {
    // Handle deep links when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event);
    });
    
    // Handle deep links that opened the app
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink({ url });
      }
    };

    getInitialURL();
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  const handleDeepLink = (event: { url: string }) => {
    if (!event.url) return;
    
    console.log('Received URL:', event.url);
    
    // Use ExpoLinking.parse instead of Linking.parse
    const parsedUrl = ExpoLinking.parse(event.url);
    console.log('Parsed URL:', parsedUrl);
    
    // Extract the token from URL
    let token: string | undefined;
    
    if (parsedUrl.path === 'verify') {
      // Option 1: If URL is like khdamli://verify?token=abc123
      token = parsedUrl.queryParams?.token as string | undefined;
    } else if (parsedUrl.path && parsedUrl.path.startsWith('verify/')) {
      // Option 2: If URL is like khdamli://verify/abc123
      const pathParts = parsedUrl.path.split('/');
      token = pathParts.length > 1 ? pathParts[1] : undefined;
    }
    
    if (token) {
      console.log('Verification token:', token);
      // Navigate to verification screen with token
      router.push({
        pathname: '/(auth)/verification' as any,
        params: { token }
      });
    }
  };
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
