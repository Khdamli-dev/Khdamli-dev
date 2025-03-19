import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(RestorAccount)"  options={{ headerShown: false }} />
      <Stack.Screen name="(signUp)" options={{ headerShown: false }} />
      
    </Stack>
  );
}