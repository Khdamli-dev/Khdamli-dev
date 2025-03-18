import { Stack } from "expo-router";
export default function submainapp(){
    return (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="screens" options={{ title: "" }} />
        </Stack>
      );
}