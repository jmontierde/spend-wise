import { Stack } from "expo-router";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function SavingsLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Savings",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Account",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Account Details",
        }}
      />
      <Stack.Screen
        name="transaction"
        options={{
          title: "Add Transaction",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
