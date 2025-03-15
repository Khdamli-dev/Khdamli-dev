import { Stack } from "expo-router";

export default function SignUpLayout() {
  

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: " 1" }} />
      <Stack.Screen name="OtherInformation" options={{ title: " 2" }} />
      <Stack.Screen name="selectionRole" options={{ title: " 3" }} />
      <Stack.Screen name="terms" options={{ title: " 4" }} />
    </Stack>
  );
}
