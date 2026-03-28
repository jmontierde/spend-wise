import { Stack } from "expo-router";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function ExpensesLayout() {
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
          title: "Expenses",
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Expense",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Edit Expense",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
