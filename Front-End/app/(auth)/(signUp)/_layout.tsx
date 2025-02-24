import { Stack } from "expo-router";

export default function SignUpLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Step1" options={{ title: "الخطوة 1" }} />
      <Stack.Screen name="Step2" options={{ title: "الخطوة 2" }} />
      <Stack.Screen name="Step3" options={{ title: "الخطوة 3" }} />
      
    </Stack>
  );
}