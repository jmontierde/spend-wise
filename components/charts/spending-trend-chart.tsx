import { View, Text, StyleSheet } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { formatCurrency } from "@/utils/format-currency";

interface SpendingTrendChartProps {
  data: {
    month: number;
    total: number;
    byCategory: Record<string, number>;
  }[];
  currency: string;
}

export function SpendingTrendChart({ data, currency }: SpendingTrendChartProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Reverse to show oldest first
  const sortedData = [...data].reverse();
  const maxTotal = Math.max(...sortedData.map((d) => d.total), 1);

  const formatMonth = (monthNum: number) => {
    const year = Math.floor(monthNum / 100);
    const month = monthNum % 100;
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString("en-US", { month: "short" });
  };

  // Calculate trend
  const totals = sortedData.map((d) => d.total);
  const recentAvg =
    totals.slice(-2).reduce((a, b) => a + b, 0) / Math.min(2, totals.length);
  const olderAvg =
    totals.slice(0, 2).reduce((a, b) => a + b, 0) / Math.min(2, totals.length);
  const trendPercentage =
    olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
  const isIncreasing = trendPercentage > 5;
  const isDecreasing = trendPercentage < -5;

  if (sortedData.length === 0 || sortedData.every((d) => d.total === 0)) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.icon }]}>
          No trend data available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.trendHeader}>
        <Text style={[styles.trendLabel, { color: colors.icon }]}>
          6-Month Trend
        </Text>
        <View
          style={[
            styles.trendBadge,
            {
              backgroundColor: isIncreasing
                ? "#ef444420"
                : isDecreasing
                  ? "#22c55e20"
                  : "#6b728020",
            },
          ]}
        >
          <Text
            style={[
              styles.trendText,
              {
                color: isIncreasing
                  ? "#ef4444"
                  : isDecreasing
                    ? "#22c55e"
                    : "#6b7280",
              },
            ]}
          >
            {isIncreasing ? "+" : ""}
            {trendPercentage.toFixed(0)}%
          </Text>
        </View>
      </View>

      <View style={styles.chart}>
        {sortedData.map((item, index) => {
          const height = (item.total / maxTotal) * 100;

          return (
            <View key={item.month} style={styles.barColumn}>
              <View style={styles.barWrapper}>
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
                        height: `${height}%`,
                        backgroundColor:
                          index === sortedData.length - 1
                            ? colors.tint
                            : colorScheme === "dark"
                              ? "#4a4a4a"
                              : "#d0d0d0",
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.barLabel, { color: colors.icon }]}>
                {formatMonth(item.month)}
              </Text>
              <Text
                style={[
                  styles.barAmount,
                  {
                    color:
                      index === sortedData.length - 1
                        ? colors.text
                        : colors.icon,
                  },
                ]}
              >
                {formatCurrency(item.total, currency)}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.icon }]}>
            Average
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatCurrency(
              sortedData.reduce((sum, d) => sum + d.total, 0) /
                sortedData.length,
              currency
            )}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.icon }]}>
            Highest
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatCurrency(maxTotal, currency)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.icon }]}>
            Total
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatCurrency(sortedData.reduce((sum, d) => sum + d.total, 0), currency)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  trendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trendLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  trendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 13,
    fontWeight: "600",
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 160,
    alignItems: "flex-end",
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  barWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  barBg: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  barAmount: {
    fontSize: 10,
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e520",
  },
  summaryItem: {
    alignItems: "center",
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  empty: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});
