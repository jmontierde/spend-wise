import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("spending_pattern"),
      v.literal("budget_prediction"),
      v.literal("anomaly"),
      v.literal("saving_tip")
    ),
    title: v.string(),
    content: v.string(),
    data: v.optional(v.any()),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("insights", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      content: args.content,
      data: args.data,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
  },
});

export const getActive = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();

    const insights = await ctx.db
      .query("insights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Filter out expired insights
    return insights.filter((insight) => insight.expiresAt > now);
  },
});

export const getByType = query({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("spending_pattern"),
      v.literal("budget_prediction"),
      v.literal("anomaly"),
      v.literal("saving_tip")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const insights = await ctx.db
      .query("insights")
      .withIndex("by_user_and_type", (q) =>
        q.eq("userId", args.userId).eq("type", args.type)
      )
      .collect();

    return insights.filter((insight) => insight.expiresAt > now);
  },
});

export const remove = mutation({
  args: { id: v.id("insights") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const clearExpired = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();

    const insights = await ctx.db
      .query("insights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const expired = insights.filter((insight) => insight.expiresAt <= now);

    for (const insight of expired) {
      await ctx.db.delete(insight._id);
    }

    return expired.length;
  },
});
