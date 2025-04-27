import { Stack } from "expo-router";



export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Apply headerShown: false globally for this stack
      }}
    >
      <Stack.Screen name="WorkerComments" />
    </Stack>
  );
}
