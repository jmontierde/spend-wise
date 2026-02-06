import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useQuery } from "convex/react";
import { format } from "date-fns";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { formatCurrency } from "@/utils/format-currency";

interface ExpenseListItemProps {
  expense: Doc<"expenses">;
  onPress?: () => void;
  currency?: string;
}

export function ExpenseListItem({
  expense,
  onPress,
  currency = "PHP",
}: ExpenseListItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const category = useQuery(api.categories.getById, { id: expense.categoryId });

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff",
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: (category?.color || "#6b7280") + "20" },
        ]}
      >
        <IconSymbol
          name={(category?.icon as any) || "ellipsis.circle.fill"}
          size={24}
          color={category?.color || "#6b7280"}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
          {expense.description}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.category, { color: colors.icon }]}>
            {category?.name || "Loading..."}
          </Text>
          {expense.aiCategorized && (
            <View style={styles.aiBadge}>
              <IconSymbol name="sparkles" size={10} color="#8b5cf6" />
              <Text style={styles.aiText}>AI</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(expense.amount, currency)}
        </Text>
        <Text style={[styles.date, { color: colors.icon }]}>
          {format(new Date(expense.date), "MMM d")}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  category: {
    fontSize: 13,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#8b5cf620",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiText: {
    fontSize: 10,
    color: "#8b5cf6",
    fontWeight: "600",
  },
  right: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
  },
});
