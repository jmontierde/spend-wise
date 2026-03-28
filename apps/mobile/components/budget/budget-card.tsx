import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { formatCurrency } from "@/utils/format-currency";

interface BudgetCardProps {
  name: string;
  spent: number;
  budget: number;
  currency: string;
  color?: string;
  onEdit?: () => void;
}

export function BudgetCard({
  name,
  spent,
  budget,
  currency,
  color,
  onEdit,
}: BudgetCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget - spent;
  const isOverBudget = spent > budget;

  const getProgressColor = () => {
    if (isOverBudget) return "#ef4444";
    if (percentage > 80) return "#f97316";
    if (percentage > 60) return "#eab308";
    return color || colors.tint;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {color && (
            <View style={[styles.colorDot, { backgroundColor: color }]} />
          )}
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        </View>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <IconSymbol name="pencil" size={16} color={colors.icon} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.amounts}>
        <View>
          <Text style={[styles.spent, { color: colors.text }]}>
            {formatCurrency(spent, currency)}
          </Text>
          <Text style={[styles.label, { color: colors.icon }]}>spent</Text>
        </View>
        <View style={styles.budgetAmount}>
          <Text style={[styles.budgetText, { color: colors.icon }]}>
            of {formatCurrency(budget, currency)}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.progressBg,
          { backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f0f0f0" },
        ]}
      >
        <View
          style={[
            styles.progressBar,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text
          style={[
            styles.remaining,
            { color: isOverBudget ? "#ef4444" : colors.icon },
          ]}
        >
          {isOverBudget
            ? `${formatCurrency(Math.abs(remaining), currency)} over budget`
            : `${formatCurrency(remaining, currency)} remaining`}
        </Text>
        <Text style={[styles.percentage, { color: colors.icon }]}>
          {percentage.toFixed(0)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    padding: 4,
  },
  amounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  spent: {
    fontSize: 28,
    fontWeight: "bold",
  },
  label: {
    fontSize: 13,
  },
  budgetAmount: {
    alignItems: "flex-end",
  },
  budgetText: {
    fontSize: 14,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  remaining: {
    fontSize: 13,
  },
  percentage: {
    fontSize: 13,
    fontWeight: "500",
  },
});
