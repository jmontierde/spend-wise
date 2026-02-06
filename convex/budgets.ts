import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    categoryId: v.optional(v.id("categories")),
    amount: v.number(),
    month: v.number(), // YYYYMM format
  },
  handler: async (ctx, args) => {
    // Check if budget already exists for this user/month/category
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_user_month_category", (q) =>
        q
          .eq("userId", args.userId)
          .eq("month", args.month)
          .eq("categoryId", args.categoryId)
      )
      .first();

    if (existing) {
      // Update existing budget
      await ctx.db.patch(existing._id, {
        amount: args.amount,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert("budgets", {
      userId: args.userId,
      categoryId: args.categoryId,
      amount: args.amount,
      month: args.month,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("budgets"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const budget = await ctx.db.get(args.id);

    if (!budget) {
      throw new Error("Budget not found");
    }

    await ctx.db.patch(args.id, {
      amount: args.amount,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("budgets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getCurrentMonthStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = new Date();
    const currentMonth = now.getFullYear() * 100 + (now.getMonth() + 1);

    // Get all budgets for current month
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", args.userId).eq("month", currentMonth)
      )
      .collect();

    // Get overall budget (no categoryId)
    const overallBudget = budgets.find((b) => !b.categoryId);
    const categoryBudgets = budgets.filter((b) => b.categoryId);

    // Calculate spending for the month
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    ).getTime();

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_and_date", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .collect();

    // Calculate total spending
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate spending by category
    const spendingByCategory: Record<string, number> = {};
    for (const expense of expenses) {
      spendingByCategory[expense.categoryId] =
        (spendingByCategory[expense.categoryId] || 0) + expense.amount;
    }

    // Build category budget status
    const categoryBudgetStatus = categoryBudgets.map((budget) => ({
      budget,
      spent: spendingByCategory[budget.categoryId!] || 0,
    }));

    return {
      overallBudget,
      totalSpent,
      categoryBudgets: categoryBudgetStatus,
      month: currentMonth,
    };
  },
});

export const getByMonth = query({
  args: {
    userId: v.id("users"),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", args.userId).eq("month", args.month)
      )
      .collect();
  },
});
