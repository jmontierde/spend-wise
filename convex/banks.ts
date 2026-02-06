import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Philippine banks and digital banks
// Logo images are stored locally in assets/images/banks/
const DEFAULT_BANKS = [
  // Digital Banks
  { name: "Maya Bank", shortName: "Maya", color: "#00D09C", interestRate: "5.25% - 5.75%", type: "digital_bank" as const },
  { name: "Tonik Digital Bank", shortName: "Tonik", color: "#7B68EE", interestRate: "4.35% - 6%", type: "digital_bank" as const },
  { name: "GoTyme Bank", shortName: "GoTyme", color: "#00CED1", interestRate: "5% - 5.5%", type: "digital_bank" as const },
  { name: "UnionDigital Bank", shortName: "UDigital", color: "#4B0082", interestRate: "4% - 4.125%", type: "digital_bank" as const },
  { name: "CIMB Bank", shortName: "CIMB", color: "#ED1C24", interestRate: "5.5% - 5.75%", type: "digital_bank" as const },
  { name: "ING Bank", shortName: "ING", color: "#FF6200", interestRate: "4% - 4.5%", type: "digital_bank" as const },
  { name: "Seabank", shortName: "SeaBank", color: "#00A9E0", interestRate: "5% - 6%", type: "digital_bank" as const },
  { name: "OwnBank", shortName: "OwnBank", color: "#000000", interestRate: "5.3% - 6.5%", type: "digital_bank" as const },
  { name: "NetBank Mobile", shortName: "NetBank", color: "#6B5B95", interestRate: "6% - 7%", type: "digital_bank" as const },
  { name: "UNO Digital Bank", shortName: "UNO", color: "#8B008B", interestRate: "4.5% - 5.25%", type: "digital_bank" as const },

  // Traditional Banks
  { name: "BPI", shortName: "BPI", color: "#C41E3A", interestRate: "0.25% - 1%", type: "bank" as const },
  { name: "BDO", shortName: "BDO", color: "#003DA5", interestRate: "0.25% - 0.5%", type: "bank" as const },
  { name: "Metrobank", shortName: "Metrobank", color: "#00529B", interestRate: "0.25% - 0.5%", type: "bank" as const },
  { name: "Security Bank", shortName: "SecBank", color: "#0066B3", interestRate: "0.25% - 1%", type: "bank" as const },
  { name: "Landbank", shortName: "Landbank", color: "#008751", interestRate: "0.25% - 0.5%", type: "bank" as const },
  { name: "PNB", shortName: "PNB", color: "#003366", interestRate: "0.25% - 0.5%", type: "bank" as const },
  { name: "RCBC", shortName: "RCBC", color: "#DAA520", interestRate: "0.25% - 1%", type: "bank" as const },
  { name: "Chinabank", shortName: "Chinabank", color: "#B22222", interestRate: "0.25% - 0.5%", type: "bank" as const },
  { name: "EastWest Bank", shortName: "EastWest", color: "#4169E1", interestRate: "0.25% - 1%", type: "bank" as const },
  { name: "UnionBank", shortName: "UnionBank", color: "#FF8C00", interestRate: "0.5% - 2%", type: "bank" as const },

  // E-Wallets
  { name: "GCash", shortName: "GCash", color: "#007DFE", interestRate: "4% - 6%", type: "e_wallet" as const },
  { name: "PayMaya", shortName: "PayMaya", color: "#00D09C", interestRate: "5%", type: "e_wallet" as const },
  { name: "GrabPay", shortName: "GrabPay", color: "#00B14F", interestRate: "3%", type: "e_wallet" as const },
  { name: "ShopeePay", shortName: "ShopeePay", color: "#EE4D2D", interestRate: "3%", type: "e_wallet" as const },
];

export const seedDefaultBanks = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("banks")
      .filter((q) => q.eq(q.field("isDefault"), true))
      .first();

    if (existing) {
      return;
    }

    for (const bank of DEFAULT_BANKS) {
      await ctx.db.insert("banks", {
        ...bank,
        isDefault: true,
      });
    }
  },
});

export const list = query({
  args: {
    type: v.optional(v.union(v.literal("bank"), v.literal("digital_bank"), v.literal("e_wallet"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("banks");

    const banks = await query.collect();

    if (args.type) {
      return banks.filter((b) => b.type === args.type);
    }

    return banks;
  },
});

export const getById = query({
  args: { id: v.id("banks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update existing banks with new short names (run once to migrate)
export const updateBankShortNames = mutation({
  args: {},
  handler: async (ctx) => {
    const banks = await ctx.db.query("banks").collect();

    for (const bank of banks) {
      const defaultBank = DEFAULT_BANKS.find((b) => b.name === bank.name);

      if (defaultBank && defaultBank.shortName !== bank.shortName) {
        await ctx.db.patch(bank._id, {
          shortName: defaultBank.shortName,
        });
      }
    }
  },
});
