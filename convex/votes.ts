import { mutation } from "./_generated/server";
import { v } from "convex/values";
import * as Votes from "./model/votes";

export const pickCard = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    cardLabel: v.string(),
    cardValue: v.number(),
    cardIcon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await Votes.pickCard(ctx, args);
  },
});

export const removeCard = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await Votes.removeCard(ctx, args);
  },
});
