import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    currency: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  categories: defineTable({
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    userId: v.optional(v.id("users")), // null for default categories
    isDefault: v.boolean(),
  }).index("by_user", ["userId"]),

  expenses: defineTable({
    userId: v.id("users"),
    categoryId: v.id("categories"),
    amount: v.number(),
    description: v.string(),
    date: v.number(), // timestamp
    notes: v.optional(v.string()),
    // Link to savings account (optional - deducts from account when set)
    savingsAccountId: v.optional(v.id("savingsAccounts")),
    // AI metadata
    aiCategorized: v.optional(v.boolean()),
    aiConfidence: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_category", ["userId", "categoryId"]),

  budgets: defineTable({
    userId: v.id("users"),
    categoryId: v.optional(v.id("categories")), // null for overall budget
    amount: v.number(),
    month: v.number(), // YYYYMM format (e.g., 202402)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_month", ["userId", "month"])
    .index("by_user_month_category", ["userId", "month", "categoryId"]),

  insights: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("spending_pattern"),
      v.literal("budget_prediction"),
      v.literal("anomaly"),
      v.literal("saving_tip")
    ),
    title: v.string(),
    content: v.string(),
    data: v.optional(v.any()), // Additional structured data
    expiresAt: v.number(), // Cache expiration
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_type", ["userId", "type"]),

  // Banks - predefined list of banks
  // Logo images are stored locally and matched by shortName
  banks: defineTable({
    name: v.string(),
    shortName: v.string(),
    color: v.string(),
    logoUrl: v.optional(v.string()), // Deprecated - logos now stored locally
    interestRate: v.optional(v.string()), // e.g., "5.25% - 5.75%"
    type: v.union(v.literal("bank"), v.literal("digital_bank"), v.literal("e_wallet")),
    isDefault: v.boolean(),
  }),

  // Savings accounts
  savingsAccounts: defineTable({
    userId: v.id("users"),
    bankId: v.id("banks"),
    accountName: v.optional(v.string()), // Custom name like "Emergency Fund"
    balance: v.number(),
    accountType: v.union(v.literal("savings"), v.literal("time_deposit")),
    interestRate: v.optional(v.number()), // Custom rate if different from bank default
    maturityDate: v.optional(v.number()), // For time deposits
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_bank", ["userId", "bankId"]),

  // Savings transactions (deposits/withdrawals)
  savingsTransactions: defineTable({
    userId: v.id("users"),
    accountId: v.id("savingsAccounts"),
    type: v.union(v.literal("deposit"), v.literal("withdrawal"), v.literal("interest")),
    amount: v.number(),
    description: v.string(),
    date: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_account", ["accountId"])
    .index("by_user_and_date", ["userId", "date"]),
});
