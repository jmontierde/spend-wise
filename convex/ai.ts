"use node";

import OpenAI from "openai";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { action } from "./_generated/server";

const client = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});

const MODEL = "openai/gpt-4o-mini";

interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export const categorizeExpense = action({
  args: {
    description: v.string(),
    amount: v.number(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ categoryId: string | undefined; confidence: number }> => {
    const categories = (await ctx.runQuery(
      api.categories.list,
      {}
    )) as Category[];

    const categoryList = categories
      .map((c: Category) => `- ${c._id}: ${c.name}`)
      .join("\n");

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expense categorization assistant. Return ONLY the category ID, nothing else.",
        },
        {
          role: "user",
          content: `Given the following expense and categories, return ONLY the category ID that best matches.

Expense: "${args.description}" ($${args.amount})

Available categories:
${categoryList}

Return ONLY the category ID (the string before the colon), nothing else.`,
        },
      ],
      max_tokens: 100,
    });

    const responseText = response.choices[0]?.message?.content?.trim() || "";

    const matchedCategory = categories.find(
      (c: Category) =>
        c._id === responseText ||
        responseText.includes(c._id) ||
        c.name.toLowerCase() === responseText.toLowerCase()
    );

    if (matchedCategory) {
      return {
        categoryId: matchedCategory._id,
        confidence: 0.8,
      };
    }

    const otherCategory = categories.find((c: Category) => c.name === "Other");
    return {
      categoryId: otherCategory?._id,
      confidence: 0.5,
    };
  },
});

export const generateInsights = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const spendingHistory = (await ctx.runQuery(
      api.expenses.getSpendingHistory,
      {
        userId: args.userId,
        months: 3,
      }
    )) as {
      month: number;
      total: number;
      byCategory: Record<string, number>;
    }[];

    const categories = (await ctx.runQuery(api.categories.list, {
      userId: args.userId,
    })) as Category[];

    const budgetStatus = await ctx.runQuery(api.budgets.getCurrentMonthStatus, {
      userId: args.userId,
    });

    const getCategoryName = (id: string) => {
      const cat = categories.find((c: Category) => c._id === id);
      return cat?.name || "Unknown";
    };

    const monthlyData = spendingHistory.map(
      (month: {
        month: number;
        total: number;
        byCategory: Record<string, number>;
      }) => {
        const categoryBreakdown = Object.entries(month.byCategory)
          .map(([id, amount]) => `${getCategoryName(id)}: $${amount}`)
          .join(", ");
        return `Month ${month.month}: Total $${month.total} (${categoryBreakdown})`;
      }
    );

    const budgetInfo = budgetStatus.overallBudget
      ? `Current month budget: $${budgetStatus.overallBudget.amount}, Spent: $${budgetStatus.totalSpent}`
      : "No budget set";

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a personal finance AI assistant. Respond only with valid JSON.",
        },
        {
          role: "user",
          content: `Analyze the following spending data and provide 2-3 actionable insights.

Spending History (last 3 months):
${monthlyData.join("\n")}

${budgetInfo}

For each insight, provide:
1. A short title (max 50 chars)
2. The insight content (2-3 sentences max)
3. The type: "spending_pattern", "budget_prediction", "anomaly", or "saving_tip"

Return ONLY a JSON array, no other text:
[{"title": "...", "content": "...", "type": "..."}]`,
        },
      ],
      max_tokens: 500,
    });

    const responseText = response.choices[0]?.message?.content?.trim() || "[]";

    let insights: {
      title: string;
      content: string;
      type: "spending_pattern" | "budget_prediction" | "anomaly" | "saving_tip";
    }[];

    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      insights = [
        {
          title: "Track Your Spending",
          content:
            "Keep adding your expenses to get personalized insights about your spending patterns.",
          type: "saving_tip",
        },
      ];
    }

    const existingInsights = (await ctx.runQuery(api.insights.getActive, {
      userId: args.userId,
    })) as Doc<"insights">[];

    for (const existing of existingInsights) {
      await ctx.runMutation(api.insights.remove, { id: existing._id });
    }

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    for (const insight of insights) {
      await ctx.runMutation(api.insights.create, {
        userId: args.userId,
        type: insight.type,
        title: insight.title,
        content: insight.content,
        expiresAt,
      });
    }

    return insights;
  },
});

export const predictBudget = action({
  args: {
    userId: v.id("users"),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const spendingHistory = (await ctx.runQuery(
      api.expenses.getSpendingHistory,
      {
        userId: args.userId,
        months: 6,
      }
    )) as {
      month: number;
      total: number;
      byCategory: Record<string, number>;
    }[];

    let totals: number[];

    if (args.categoryId) {
      totals = spendingHistory.map(
        (m: { byCategory: Record<string, number> }) =>
          (m.byCategory[args.categoryId!] as number) || 0
      );
    } else {
      totals = spendingHistory.map((m: { total: number }) => m.total);
    }

    const validTotals = totals.filter((t) => t > 0);

    if (validTotals.length === 0) {
      return {
        predictedAmount: 0,
        confidence: 0,
        trend: "stable" as const,
      };
    }

    const average = validTotals.reduce((a, b) => a + b, 0) / validTotals.length;

    const recentAvg = validTotals.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
    const olderAvg =
      validTotals.slice(-2).reduce((a, b) => a + b, 0) /
      Math.min(validTotals.length, 2);

    let trend: "increasing" | "decreasing" | "stable";
    if (recentAvg > olderAvg * 1.1) {
      trend = "increasing";
    } else if (recentAvg < olderAvg * 0.9) {
      trend = "decreasing";
    } else {
      trend = "stable";
    }

    const weights = [0.3, 0.25, 0.2, 0.15, 0.07, 0.03];
    let predictedAmount = 0;
    let totalWeight = 0;

    for (let i = 0; i < validTotals.length && i < weights.length; i++) {
      predictedAmount += validTotals[i] * weights[i];
      totalWeight += weights[i];
    }

    predictedAmount = predictedAmount / totalWeight;

    const variance =
      validTotals.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) /
      validTotals.length;
    const stdDev = Math.sqrt(variance);
    const coeffOfVariation = average > 0 ? stdDev / average : 1;
    const confidence = Math.max(0, Math.min(1, 1 - coeffOfVariation));

    return {
      predictedAmount: Math.round(predictedAmount * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      trend,
    };
  },
});
