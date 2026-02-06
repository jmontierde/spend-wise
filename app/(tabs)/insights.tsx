import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useAction } from "convex/react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { InsightCard } from "@/components/insights/insight-card";
import { SpendingChart } from "@/components/charts/spending-chart";
import { SpendingTrendChart } from "@/components/charts/spending-trend-chart";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

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

  const spendingHistory = useQuery(
    api.expenses.getSpendingHistory,
    currentUser ? { userId: currentUser._id, months: 6 } : "skip"
  );

  const categories = useQuery(api.categories.list, { userId: currentUser?._id });

  const insights = useQuery(
    api.insights.getActive,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const generateInsights = useAction(api.ai.generateInsights);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Convex queries auto-refresh, just simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const handleGenerateInsights = async () => {
    if (!currentUser) return;

    setGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await generateInsights({ userId: currentUser._id });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to generate insights:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setGenerating(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((c: { _id: string; name: string }) => c._id === categoryId);
    return category?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories?.find((c: { _id: string; color: string }) => c._id === categoryId);
    return category?.color || "#6b7280";
  };

  const categorySpending = monthlySpending?.byCategory
    ? Object.entries(monthlySpending.byCategory).map(([id, amount]) => ({
        id,
        name: getCategoryName(id),
        amount: amount as number,
        color: getCategoryColor(id),
      }))
    : [];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>AI Insights</Text>
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: colors.tint }]}
            onPress={handleGenerateInsights}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <IconSymbol name="sparkles" size={16} color="#fff" />
                <Text style={styles.generateText}>Generate</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {insights && insights.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Insights
            </Text>
            <View style={styles.insightsList}>
              {insights.map((insight: Doc<"insights">) => (
                <InsightCard key={insight._id} insight={insight} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Spending by Category
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
            ]}
          >
            {categorySpending.length > 0 ? (
              <SpendingChart
                data={categorySpending}
                currency={currentUser?.currency || "PHP"}
              />
            ) : (
              <View style={styles.emptyChart}>
                <IconSymbol name="chart.bar" size={48} color={colors.icon} />
                <Text style={[styles.emptyText, { color: colors.icon }]}>
                  Add expenses to see spending breakdown
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6-Month Trend
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff" },
            ]}
          >
            {spendingHistory && spendingHistory.some((m: { total: number }) => m.total > 0) ? (
              <SpendingTrendChart
                data={spendingHistory}
                currency={currentUser?.currency || "PHP"}
              />
            ) : (
              <View style={styles.emptyChart}>
                <IconSymbol name="chart.line.uptrend.xyaxis" size={48} color={colors.icon} />
                <Text style={[styles.emptyText, { color: colors.icon }]}>
                  Track expenses over time to see trends
                </Text>
              </View>
            )}
          </View>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  generateText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  insightsList: {
    paddingHorizontal: 16,
    gap: 12,
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
  emptyChart: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
});
