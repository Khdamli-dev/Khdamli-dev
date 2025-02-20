import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="(RestorAccount)"  options={{ headerShown: false }} />
      <Stack.Screen name="(signup)" options={{ headerShown: false }} />
      
    </Stack>
  );
}