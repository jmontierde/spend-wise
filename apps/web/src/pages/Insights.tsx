import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { Sparkles, BarChart3, TrendingUp } from "lucide-react";
import { api } from "@convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import InsightCard from "@/components/insights/InsightCard";
import SpendingChart from "@/components/charts/SpendingChart";
import SpendingTrendChart from "@/components/charts/SpendingTrendChart";
import { SkeletonInsightCard, SkeletonChart } from "@/components/ui/Skeleton";

export default function Insights() {
  const { currentUser } = useCurrentUser();
  const [generating, setGenerating] = useState(false);

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

  const categories = useQuery(api.categories.list, {
    userId: currentUser?._id,
  });

  const insights = useQuery(
    api.insights.getActive,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const generateInsights = useAction(api.ai.generateInsights);

  const handleGenerate = async () => {
    if (!currentUser) return;
    setGenerating(true);
    try {
      await generateInsights({ userId: currentUser._id });
    } catch (error) {
      console.error("Failed to generate insights:", error);
    } finally {
      setGenerating(false);
    }
  };

  const getCategoryName = (id: string) =>
    categories?.find((c: any) => c._id === id)?.name || "Unknown";
  const getCategoryColor = (id: string) =>
    categories?.find((c: any) => c._id === id)?.color || "#6b7280";

  const categorySpending = monthlySpending?.byCategory
    ? Object.entries(monthlySpending.byCategory).map(([id, amount]) => ({
        name: getCategoryName(id),
        amount: amount as number,
        color: getCategoryColor(id),
      }))
    : [];

  const currency = currentUser?.currency || "PHP";

  return (
    <div>
      <Header title="Insights" />
      <div className="p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">AI Insights</h2>
          <Button onClick={handleGenerate} disabled={generating}>
            <Sparkles size={16} />
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>

        {/* AI Insights */}
        {insights === undefined ? (
          <div className="mb-6 space-y-3">
            <SkeletonInsightCard />
            <SkeletonInsightCard />
          </div>
        ) : (
          insights.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Your Insights</h3>
              <div className="space-y-3">
                {insights.map((insight: any) => (
                  <InsightCard key={insight._id} insight={insight} />
                ))}
              </div>
            </div>
          )
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending by Category */}
          {monthlySpending === undefined ? (
            <SkeletonChart />
          ) : (
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Spending by Category</h3>
              {categorySpending.length > 0 ? (
                <SpendingChart data={categorySpending} currency={currency} />
              ) : (
                <EmptyState
                  icon={<BarChart3 size={48} />}
                  title="No data yet"
                  subtitle="Add expenses to see spending breakdown"
                />
              )}
            </Card>
          )}

          {/* 6-Month Trend */}
          {spendingHistory === undefined ? (
            <SkeletonChart />
          ) : (
            <Card className="p-5">
              <h3 className="font-semibold mb-4">6-Month Trend</h3>
              {spendingHistory.some((m: any) => m.total > 0) ? (
                <SpendingTrendChart
                  data={spendingHistory}
                  currency={currency}
                />
              ) : (
                <EmptyState
                  icon={<TrendingUp size={48} />}
                  title="No data yet"
                  subtitle="Track expenses over time to see trends"
                />
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
