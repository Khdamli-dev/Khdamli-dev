import { Stack } from "expo-router";

export default function SignUpLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "الخطوة 1" }} />
      <Stack.Screen name="Verification" options={{ title: "الخطوة 2" }} />
      <Stack.Screen name="newPassword" options={{ title: "الخطوة 3" }} />

    </Stack>
  );
}