import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useMutation } from "convex/react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { ExpenseForm } from "@/components/expense/expense-form";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function EditExpenseScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();

  const currentUser = useQuery(
    api.auth.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const expense = useQuery(
    api.expenses.getById,
    id ? { id: id as Id<"expenses"> } : "skip"
  );

  const deleteExpense = useMutation(api.expenses.remove);

  const handleDelete = () => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense({ id: id as Id<"expenses"> });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error) {
              console.error("Failed to delete expense:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  if (!currentUser || !expense) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ExpenseForm
        userId={currentUser._id}
        expense={expense}
        currency={currentUser.currency || "PHP"}
        onSuccess={() => router.back()}
        onCancel={() => router.back()}
      />

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <IconSymbol name="trash.fill" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deleteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ef444420",
    justifyContent: "center",
    alignItems: "center",
  },
});
