import { Stack } from "expo-router";
import { useEffect } from "react";

export default function AuthLayout() {
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: " 1" }} />
      <Stack.Screen name="requeste" options={{ title: " 2" }} />
    </Stack>
  );
}