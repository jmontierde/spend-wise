import { View, Text, StyleSheet } from "react-native";

import { Doc } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface InsightCardProps {
  insight: Doc<"insights">;
}

const INSIGHT_CONFIG = {
  spending_pattern: {
    icon: "chart.line.uptrend.xyaxis",
    color: "#3b82f6",
    label: "Pattern",
  },
  budget_prediction: {
    icon: "chart.bar.doc.horizontal",
    color: "#8b5cf6",
    label: "Prediction",
  },
  anomaly: {
    icon: "exclamationmark.triangle.fill",
    color: "#f97316",
    label: "Alert",
  },
  saving_tip: {
    icon: "lightbulb.fill",
    color: "#22c55e",
    label: "Tip",
  },
};

export function InsightCard({ insight }: InsightCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const config = INSIGHT_CONFIG[insight.type];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[styles.iconContainer, { backgroundColor: config.color + "20" }]}
        >
          <IconSymbol
            name={config.icon as any}
            size={20}
            color={config.color}
          />
        </View>
        <View style={[styles.badge, { backgroundColor: config.color + "20" }]}>
          <Text style={[styles.badgeText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{insight.title}</Text>
      <Text style={[styles.content, { color: colors.icon }]}>
        {insight.content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
});
