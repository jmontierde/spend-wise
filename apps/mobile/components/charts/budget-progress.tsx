import { View, Text, StyleSheet } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { formatCurrency } from "@/utils/format-currency";

interface BudgetProgressProps {
  spent: number;
  budget: number;
  currency: string;
}

export function BudgetProgress({ spent, budget, currency }: BudgetProgressProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget - spent;
  const isOverBudget = spent > budget;

  const getProgressColor = () => {
    if (isOverBudget) return "#ef4444";
    if (percentage > 80) return "#f97316";
    if (percentage > 60) return "#eab308";
    return "#22c55e";
  };

  // Calculate days remaining in month
  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const daysPassed = now.getDate();
  const daysRemaining = daysInMonth - daysPassed;

  // Calculate daily budget
  const dailyBudget = remaining > 0 ? remaining / daysRemaining : 0;

  return (
    <View style={styles.container}>
      <View style={styles.amounts}>
        <View>
          <Text style={[styles.spentLabel, { color: colors.icon }]}>
            Spent
          </Text>
          <Text style={[styles.spent, { color: colors.text }]}>
            {formatCurrency(spent, currency)}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.budgetLabel, { color: colors.icon }]}>
            Budget
          </Text>
          <Text style={[styles.budget, { color: colors.text }]}>
            {formatCurrency(budget, currency)}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.progressBg,
          {
            backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f0f0f0",
          },
        ]}
      >
        <View
          style={[
            styles.progressBar,
            {
              width: `${percentage}%`,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
        {/* Markers at 50% and 80% */}
        <View style={[styles.marker, { left: "50%" }]} />
        <View style={[styles.marker, { left: "80%" }]} />
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text
            style={[
              styles.remainingAmount,
              { color: isOverBudget ? "#ef4444" : colors.text },
            ]}
          >
            {isOverBudget
              ? formatCurrency(Math.abs(remaining), currency)
              : formatCurrency(remaining, currency)}
          </Text>
          <Text style={[styles.remainingLabel, { color: colors.icon }]}>
            {isOverBudget ? "over budget" : "remaining"}
          </Text>
        </View>

        {!isOverBudget && daysRemaining > 0 && (
          <View style={[styles.footerItem, { alignItems: "flex-end" }]}>
            <Text style={[styles.dailyAmount, { color: colors.text }]}>
              {formatCurrency(dailyBudget, currency)}
            </Text>
            <Text style={[styles.dailyLabel, { color: colors.icon }]}>
              per day for {daysRemaining} days
            </Text>
          </View>
        )}
      </View>

      <View style={styles.percentageRow}>
        <View
          style={[
            styles.percentageBadge,
            { backgroundColor: getProgressColor() + "20" },
          ]}
        >
          <Text style={[styles.percentageText, { color: getProgressColor() }]}>
            {percentage.toFixed(0)}% used
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  amounts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  spentLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  spent: {
    fontSize: 24,
    fontWeight: "bold",
  },
  budgetLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  budget: {
    fontSize: 18,
    fontWeight: "600",
  },
  progressBg: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
  },
  marker: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerItem: {
    gap: 2,
  },
  remainingAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  remainingLabel: {
    fontSize: 12,
  },
  dailyAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  dailyLabel: {
    fontSize: 12,
  },
  percentageRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  percentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
