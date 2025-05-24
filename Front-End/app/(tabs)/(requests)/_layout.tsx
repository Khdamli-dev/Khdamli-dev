import { Stack } from "expo-router";

export default function RequestsLayout() {
  return (
    <Stack>
      <Stack.Screen name="(clientrequest)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(comment)"
        options={{
          headerShown: true,
          title: "Your comments Request", // Change header text
          headerStyle: {
            backgroundColor: "#4C8479", // Change header background color
          },
          headerTitleStyle: {
            color: "#ffffff", // Change header text color
            fontWeight: "bold", // Optional: make text bold
          },
          headerTintColor: "#ffffff", // Change back button and items color
        }}
      />
    </Stack>
  );
}
