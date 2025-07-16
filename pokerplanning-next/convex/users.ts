import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const join = mutation({
  args: {
    roomId: v.id("rooms"),
    name: v.string(),
    isSpectator: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Update room activity
    await ctx.db.patch(args.roomId, {
      lastActivityAt: Date.now(),
    });
    
    // Create user
    const userId = await ctx.db.insert("users", {
      roomId: args.roomId,
      name: args.name,
      isSpectator: args.isSpectator ?? false,
      joinedAt: Date.now(),
    });
    
    return userId;
  },
});

export const edit = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    isSpectator: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    // Update room activity
    await ctx.db.patch(user.roomId, {
      lastActivityAt: Date.now(),
    });
    
    // Update user
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.isSpectator !== undefined) updates.isSpectator = args.isSpectator;
    
    await ctx.db.patch(args.userId, updates);
  },
});

export const leave = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    
    // Delete user's votes
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room_user", (q) => 
        q.eq("roomId", user.roomId).eq("userId", args.userId)
      )
      .collect();
    
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
    
    // Delete user
    await ctx.db.delete(args.userId);
    
    // Update room activity
    await ctx.db.patch(user.roomId, {
      lastActivityAt: Date.now(),
    });
  },
});