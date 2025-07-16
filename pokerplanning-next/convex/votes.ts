import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const pickCard = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    cardLabel: v.string(),
    cardValue: v.number(),
    cardIcon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Update room activity
    await ctx.db.patch(args.roomId, {
      lastActivityAt: Date.now(),
    });
    
    // Check if vote exists
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_room_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", args.userId)
      )
      .first();
    
    if (existing) {
      // Update existing vote
      await ctx.db.patch(existing._id, {
        cardLabel: args.cardLabel,
        cardValue: args.cardValue,
        cardIcon: args.cardIcon,
      });
    } else {
      // Create new vote
      await ctx.db.insert("votes", {
        roomId: args.roomId,
        userId: args.userId,
        cardLabel: args.cardLabel,
        cardValue: args.cardValue,
        cardIcon: args.cardIcon,
      });
    }
  },
});

export const removeCard = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Update room activity
    await ctx.db.patch(args.roomId, {
      lastActivityAt: Date.now(),
    });
    
    // Find and delete vote
    const vote = await ctx.db
      .query("votes")
      .withIndex("by_room_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", args.userId)
      )
      .first();
    
    if (vote) {
      await ctx.db.delete(vote._id);
    }
  },
});