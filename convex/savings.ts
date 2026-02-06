import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createAccount = mutation({
  args: {
    userId: v.id("users"),
    bankId: v.id("banks"),
    accountName: v.optional(v.string()),
    balance: v.number(),
    accountType: v.union(v.literal("savings"), v.literal("time_deposit")),
    interestRate: v.optional(v.number()),
    maturityDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("savingsAccounts", {
      userId: args.userId,
      bankId: args.bankId,
      accountName: args.accountName,
      balance: args.balance,
      accountType: args.accountType,
      interestRate: args.interestRate,
      maturityDate: args.maturityDate,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateAccount = mutation({
  args: {
    id: v.id("savingsAccounts"),
    accountName: v.optional(v.string()),
    balance: v.optional(v.number()),
    interestRate: v.optional(v.number()),
    maturityDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const account = await ctx.db.get(id);

    if (!account) {
      throw new Error("Account not found");
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

export const deleteAccount = mutation({
  args: { id: v.id("savingsAccounts") },
  handler: async (ctx, args) => {
    // Delete all transactions for this account first
    const transactions = await ctx.db
      .query("savingsTransactions")
      .withIndex("by_account", (q) => q.eq("accountId", args.id))
      .collect();

    for (const tx of transactions) {
      await ctx.db.delete(tx._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const listAccounts = query({
  args: {
    userId: v.id("users"),
    accountType: v.optional(v.union(v.literal("savings"), v.literal("time_deposit"))),
  },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("savingsAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (args.accountType) {
      return accounts.filter((a) => a.accountType === args.accountType);
    }

    return accounts;
  },
});

export const getAccountById = query({
  args: { id: v.id("savingsAccounts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getTotalBalance = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("savingsAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const total = accounts.reduce((sum, account) => sum + account.balance, 0);
    const savingsTotal = accounts
      .filter((a) => a.accountType === "savings")
      .reduce((sum, a) => sum + a.balance, 0);
    const timeDepositTotal = accounts
      .filter((a) => a.accountType === "time_deposit")
      .reduce((sum, a) => sum + a.balance, 0);

    return {
      total,
      savingsTotal,
      timeDepositTotal,
      accountCount: accounts.length,
    };
  },
});

// Transactions
export const addTransaction = mutation({
  args: {
    userId: v.id("users"),
    accountId: v.id("savingsAccounts"),
    type: v.union(v.literal("deposit"), v.literal("withdrawal"), v.literal("interest")),
    amount: v.number(),
    description: v.string(),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Update account balance
    let newBalance = account.balance;
    if (args.type === "deposit" || args.type === "interest") {
      newBalance += args.amount;
    } else {
      newBalance -= args.amount;
    }

    await ctx.db.patch(args.accountId, {
      balance: newBalance,
      updatedAt: Date.now(),
    });

    // Create transaction record
    return await ctx.db.insert("savingsTransactions", {
      userId: args.userId,
      accountId: args.accountId,
      type: args.type,
      amount: args.amount,
      description: args.description,
      date: args.date,
      createdAt: Date.now(),
    });
  },
});

export const listTransactions = query({
  args: {
    userId: v.id("users"),
    accountId: v.optional(v.id("savingsAccounts")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let transactions;
    if (args.accountId) {
      transactions = await ctx.db
        .query("savingsTransactions")
        .withIndex("by_account", (q) => q.eq("accountId", args.accountId))
        .order("desc")
        .take(limit);
    } else {
      transactions = await ctx.db
        .query("savingsTransactions")
        .withIndex("by_user_and_date", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(limit);
    }

    return transactions;
  },
});

export const getRecentTransactions = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    return await ctx.db
      .query("savingsTransactions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});
