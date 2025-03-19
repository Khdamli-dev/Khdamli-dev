import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: " 1" }} />
      <Stack.Screen name="requeste" options={{ title: " 2" }} />
    </Stack>
  );
}