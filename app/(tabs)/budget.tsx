import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/convex/_generated/api";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { BudgetCard } from "@/components/budget/budget-card";
import { BudgetForm } from "@/components/budget/budget-form";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function BudgetScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  const currentUser = useQuery(
    api.auth.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const budgetStatus = useQuery(
    api.budgets.getCurrentMonthStatus,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const categories = useQuery(api.categories.list, { userId: currentUser?._id });

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((c: { _id: string; name: string }) => c._id === categoryId);
    return category?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories?.find((c: { _id: string; color: string }) => c._id === categoryId);
    return category?.color || "#6b7280";
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Budget</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => setShowForm(true)}
          >
            <IconSymbol name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {budgetStatus?.overallBudget ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Overall Budget
            </Text>
            <BudgetCard
              name="Total Budget"
              spent={budgetStatus.totalSpent}
              budget={budgetStatus.overallBudget.amount}
              currency={currentUser?.currency || "PHP"}
              onEdit={() => handleEdit(budgetStatus.overallBudget)}
            />
          </View>
        ) : (
          <View
            style={[
              styles.emptyOverall,
              { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
            ]}
          >
            <IconSymbol name="wallet.pass" size={48} color={colors.icon} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Set a Monthly Budget
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
              Track your spending against a budget goal
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.tint }]}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.emptyButtonText}>Create Budget</Text>
            </TouchableOpacity>
          </View>
        )}

        {budgetStatus?.categoryBudgets &&
          budgetStatus.categoryBudgets.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Category Budgets
              </Text>
              <View style={styles.categoryBudgets}>
                {budgetStatus.categoryBudgets.map((item: any) => (
                  <BudgetCard
                    key={item.budget._id}
                    name={getCategoryName(item.budget.categoryId)}
                    spent={item.spent}
                    budget={item.budget.amount}
                    currency={currentUser?.currency || "PHP"}
                    color={getCategoryColor(item.budget.categoryId)}
                    onEdit={() => handleEdit(item.budget)}
                  />
                ))}
              </View>
            </View>
          )}

        <View style={styles.tip}>
          <IconSymbol name="lightbulb.fill" size={20} color="#eab308" />
          <Text style={[styles.tipText, { color: colors.icon }]}>
            Set category budgets to get more detailed tracking and alerts when
            you&apos;re close to your limits.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[styles.modalCancel, { color: colors.tint }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingBudget ? "Edit Budget" : "New Budget"}
            </Text>
            <View style={{ width: 60 }} />
          </View>
          {currentUser && (
            <BudgetForm
              userId={currentUser._id}
              budget={editingBudget}
              onSuccess={handleClose}
            />
          )}
        </View>
      </Modal>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryBudgets: {
    gap: 12,
  },
  emptyOverall: {
    marginHorizontal: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  tip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: "#eab30810",
    borderRadius: 12,
    marginBottom: 32,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});
