import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { ExpenseListItem } from "@/components/expense/expense-list-item";
import { BudgetProgress } from "@/components/charts/budget-progress";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { formatCurrency } from "@/utils/format-currency";

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { user } = useUser();

  const currentUser = useQuery(
    api.auth.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const currentMonth =
    new Date().getFullYear() * 100 + (new Date().getMonth() + 1);

  const monthlySpending = useQuery(
    api.expenses.getMonthlySpending,
    currentUser ? { userId: currentUser._id, month: currentMonth } : "skip"
  );

  const recentExpenses = useQuery(
    api.expenses.getRecent,
    currentUser ? { userId: currentUser._id, limit: 5 } : "skip"
  );

  const budgetStatus = useQuery(
    api.budgets.getCurrentMonthStatus,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.icon }]}>
              Hello, {currentUser?.name?.split(" ")[0] || "there"}
            </Text>
            <Text style={[styles.date, { color: colors.text }]}>
              {format(new Date(), "EEEE, MMMM d")}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: colors.tint },
            ]}
            onPress={() => router.push("/(tabs)/expenses/add")}
          >
            <IconSymbol name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.spendingCard,
            { backgroundColor: colors.tint },
          ]}
        >
          <Text style={styles.spendingLabel}>Spent this month</Text>
          <Text style={styles.spendingAmount}>
            {formatCurrency(monthlySpending?.total || 0, currentUser?.currency || "PHP")}
          </Text>
          <Text style={styles.spendingMeta}>
            {monthlySpending?.expenseCount || 0} transactions
          </Text>
        </View>

        {budgetStatus && budgetStatus.overallBudget && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Budget Progress
            </Text>
            <View
              style={[
                styles.card,
                { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
              ]}
            >
              <BudgetProgress
                spent={budgetStatus.totalSpent}
                budget={budgetStatus.overallBudget.amount}
                currency={currentUser?.currency || "PHP"}
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Expenses
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/expenses")}>
              <Text style={[styles.seeAll, { color: colors.tint }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {recentExpenses && recentExpenses.length > 0 ? (
            <View style={styles.expensesList}>
              {recentExpenses.map((expense: Doc<"expenses">) => (
                <ExpenseListItem
                  key={expense._id}
                  expense={expense}
                  currency={currentUser?.currency || "PHP"}
                  onPress={() =>
                    router.push(`/(tabs)/expenses/${expense._id}`)
                  }
                />
              ))}
            </View>
          ) : (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
              ]}
            >
              <IconSymbol
                name="receipt"
                size={48}
                color={colors.icon}
              />
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                No expenses yet
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.tint }]}
                onPress={() => router.push("/(tabs)/expenses/add")}
              >
                <Text style={styles.emptyButtonText}>Add your first expense</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  spendingCard: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  spendingLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 8,
  },
  spendingAmount: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 4,
  },
  spendingMeta: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  card: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  expensesList: {
    gap: 4,
  },
  emptyState: {
    marginHorizontal: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
