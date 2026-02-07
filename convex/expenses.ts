import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    categoryId: v.id("categories"),
    amount: v.number(),
    description: v.string(),
    date: v.number(),
    notes: v.optional(v.string()),
    savingsAccountId: v.optional(v.id("savingsAccounts")),
    aiCategorized: v.optional(v.boolean()),
    aiConfidence: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // If linked to a savings account, deduct the amount
    if (args.savingsAccountId) {
      const account = await ctx.db.get(args.savingsAccountId);
      if (!account) {
        throw new Error("Savings account not found");
      }

      // Deduct from savings account balance
      await ctx.db.patch(args.savingsAccountId, {
        balance: account.balance - args.amount,
        updatedAt: now,
      });

      // Create a withdrawal transaction in savings
      await ctx.db.insert("savingsTransactions", {
        userId: args.userId,
        accountId: args.savingsAccountId,
        type: "withdrawal",
        amount: args.amount,
        description: `Expense: ${args.description}`,
        date: args.date,
        createdAt: now,
      });
    }

    return await ctx.db.insert("expenses", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const list = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let query = ctx.db
      .query("expenses")
      .withIndex("by_user_and_date", (q) => q.eq("userId", args.userId))
      .order("desc");

    const expenses = await query.take(limit + 1);

    const hasMore = expenses.length > limit;
    const items = hasMore ? expenses.slice(0, -1) : expenses;

    return {
      items,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]._id : null,
    };
  },
});

export const getById = query({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("expenses"),
    categoryId: v.optional(v.id("categories")),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    date: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const expense = await ctx.db.get(id);

    if (!expense) {
      throw new Error("Expense not found");
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const expense = await ctx.db.get(args.id);

    if (!expense) {
      throw new Error("Expense not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const getRecent = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;

    return await ctx.db
      .query("expenses")
      .withIndex("by_user_and_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

export const getMonthlySpending = query({
  args: {
    userId: v.id("users"),
    month: v.number(), // YYYYMM format
  },
  handler: async (ctx, args) => {
    // Calculate start and end of month
    const year = Math.floor(args.month / 100);
    const month = args.month % 100;
    const startDate = new Date(year, month - 1, 1).getTime();
    const endDate = new Date(year, month, 0, 23, 59, 59, 999).getTime();

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

    // Aggregate by category
    const byCategory: Record<string, number> = {};
    let total = 0;

    for (const expense of expenses) {
      const categoryId = expense.categoryId;
      byCategory[categoryId] = (byCategory[categoryId] || 0) + expense.amount;
      total += expense.amount;
    }

    return {
      total,
      byCategory,
      expenseCount: expenses.length,
    };
  },
});

export const getExpensesByMonth = query({
  args: {
    userId: v.id("users"),
    year: v.number(),
    month: v.number(), // 1-12
  },
  handler: async (ctx, args) => {
    const startDate = new Date(args.year, args.month - 1, 1).getTime();
    const endDate = new Date(args.year, args.month, 0, 23, 59, 59, 999).getTime();

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

    // Group by day
    const byDay: Record<string, { total: number; count: number; expenses: typeof expenses }> = {};

    for (const expense of expenses) {
      const date = new Date(expense.date);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (!byDay[dayKey]) {
        byDay[dayKey] = { total: 0, count: 0, expenses: [] };
      }
      byDay[dayKey].total += expense.amount;
      byDay[dayKey].count += 1;
      byDay[dayKey].expenses.push(expense);
    }

    return {
      expenses,
      byDay,
      total: expenses.reduce((sum, e) => sum + e.amount, 0),
    };
  },
});

export const getSpendingHistory = query({
  args: {
    userId: v.id("users"),
    months: v.optional(v.number()), // Number of months to look back
  },
  handler: async (ctx, args) => {
    const monthsBack = args.months ?? 6;
    const now = new Date();
    const results: Array<{
      month: number;
      total: number;
      byCategory: Record<string, number>;
    }> = [];

    for (let i = 0; i < monthsBack; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getFullYear() * 100 + (date.getMonth() + 1);
      const startDate = date.getTime();
      const endDate = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
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

      const byCategory: Record<string, number> = {};
      let total = 0;

      for (const expense of expenses) {
        byCategory[expense.categoryId] =
          (byCategory[expense.categoryId] || 0) + expense.amount;
        total += expense.amount;
      }

      results.push({ month, total, byCategory });
    }

    return results;
  },
});
