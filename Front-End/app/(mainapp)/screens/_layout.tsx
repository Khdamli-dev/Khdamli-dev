import { Stack } from "expo-router";
export default function mainapp(){
    return (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" options={{ title: "" }} />
          <Stack.Screen name="ProfileScreen" options={{ title: "" }} />
          <Stack.Screen name="Settings" options={{ title: "" }} />
        </Stack>
      );
}