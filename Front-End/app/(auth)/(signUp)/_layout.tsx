import { Stack } from "expo-router";

export default function SignUpLayout() {
  

  return (
    <Stack  screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "الخطوة 1" }} />
      <Stack.Screen name="OtherInformation" options={{ title: "الخطوة 2" }} />
      <Stack.Screen name="selectionRole" options={{ title: "الخطوة 3" }} />
      <Stack.Screen name="terms" options={{ title: "الخطوة 4" }} />
    </Stack>
  );
}
