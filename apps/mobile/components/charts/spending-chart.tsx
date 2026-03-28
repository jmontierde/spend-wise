import { View, Text, StyleSheet } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { formatCurrency } from "@/utils/format-currency";

interface SpendingChartProps {
  data: {
    id: string;
    name: string;
    amount: number;
    color: string;
  }[];
  currency: string;
}

export function SpendingChart({ data, currency }: SpendingChartProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const sortedData = [...data].sort((a, b) => b.amount - a.amount);
  const maxAmount = sortedData.length > 0 ? sortedData[0].amount : 0;
  const total = sortedData.reduce((sum, item) => sum + item.amount, 0);

  if (sortedData.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.icon }]}>
          No spending data available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sortedData.slice(0, 6).map((item) => {
        const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
        const sharePercentage = total > 0 ? (item.amount / total) * 100 : 0;

        return (
          <View key={item.id} style={styles.row}>
            <View style={styles.labelContainer}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text
                style={[styles.label, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </View>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.barBg,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2a2a2a" : "#f0f0f0",
                  },
                ]}
              >
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.amount, { color: colors.text }]}>
                {formatCurrency(item.amount, currency)}
              </Text>
              <Text style={[styles.percentage, { color: colors.icon }]}>
                {sharePercentage.toFixed(0)}%
              </Text>
            </View>
          </View>
        );
      })}

      {sortedData.length > 6 && (
        <Text style={[styles.more, { color: colors.icon }]}>
          +{sortedData.length - 6} more categories
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  row: {
    gap: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 4,
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 70,
    textAlign: "right",
  },
  percentage: {
    fontSize: 12,
    minWidth: 35,
    textAlign: "right",
  },
  more: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  empty: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});
