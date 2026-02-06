import { View, FlatList, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";

import { api } from "@/convex/_generated/api";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { ExpenseListItem } from "@/components/expense/expense-list-item";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function ExpensesListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user } = useUser();

  const currentUser = useQuery(
    api.auth.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const expensesData = useQuery(
    api.expenses.list,
    currentUser ? { userId: currentUser._id, limit: 50 } : "skip"
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="receipt" size={64} color={colors.icon} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No expenses yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
        Start tracking your spending by adding your first expense
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.tint }]}
        onPress={() => router.push("/(tabs)/expenses/add")}
      >
        <IconSymbol name="plus" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={expensesData?.items || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ExpenseListItem
            expense={item}
            currency={currentUser?.currency || "PHP"}
            onPress={() => router.push(`/(tabs)/expenses/${item._id}`)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          (!expensesData?.items || expensesData.items.length === 0) && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push("/(tabs)/expenses/add")}
      >
        <IconSymbol name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
