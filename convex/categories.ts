import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Default categories with icons and colors
const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", icon: "fork.knife", color: "#ef4444" },
  { name: "Transportation", icon: "car.fill", color: "#f97316" },
  { name: "Shopping", icon: "bag.fill", color: "#eab308" },
  { name: "Entertainment", icon: "tv.fill", color: "#84cc16" },
  { name: "Bills & Utilities", icon: "bolt.fill", color: "#22c55e" },
  { name: "Healthcare", icon: "heart.fill", color: "#14b8a6" },
  { name: "Travel", icon: "airplane", color: "#06b6d4" },
  { name: "Education", icon: "book.fill", color: "#3b82f6" },
  { name: "Personal Care", icon: "sparkles", color: "#8b5cf6" },
  { name: "Groceries", icon: "cart.fill", color: "#a855f7" },
  { name: "Subscriptions", icon: "repeat", color: "#ec4899" },
  { name: "Other", icon: "ellipsis.circle.fill", color: "#6b7280" },
];

export const seedDefaultCategories = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if default categories already exist
    const existing = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("isDefault"), true))
      .first();

    if (existing) {
      return;
    }

    // Insert default categories
    for (const category of DEFAULT_CATEGORIES) {
      await ctx.db.insert("categories", {
        ...category,
        isDefault: true,
      });
    }
  },
});

export const list = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    // Get default categories
    const defaultCategories = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("isDefault"), true))
      .collect();

    // Get user's custom categories if userId provided
    let customCategories: typeof defaultCategories = [];
    if (args.userId) {
      customCategories = await ctx.db
        .query("categories")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
    }

    return [...defaultCategories, ...customCategories];
  },
});

export const getById = query({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    icon: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("categories", {
      name: args.name,
      icon: args.icon,
      color: args.color,
      userId: args.userId,
      isDefault: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const category = await ctx.db.get(id);

    if (!category) {
      throw new Error("Category not found");
    }

    if (category.isDefault) {
      throw new Error("Cannot modify default categories");
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, filteredUpdates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);

    if (!category) {
      throw new Error("Category not found");
    }

    if (category.isDefault) {
      throw new Error("Cannot delete default categories");
    }

    await ctx.db.delete(args.id);
  },
});
