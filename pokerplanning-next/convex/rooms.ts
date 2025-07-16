import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new room
export const create = mutation({
  args: {
    name: v.string(),
    roomType: v.union(v.literal("classic"), v.literal("canvas")),
    votingCategorized: v.optional(v.boolean()),
    autoCompleteVoting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      roomType: args.roomType,
      votingCategorized: args.votingCategorized ?? true,
      autoCompleteVoting: args.autoCompleteVoting ?? false,
      isGameOver: false,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
    });

    return roomId;
  },
});

// Get room with all related data
export const get = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    // Get all users in the room
    const users = await ctx.db
      .query("users")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Get all votes
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Hide card values if game is not over
    const sanitizedVotes = votes.map((vote) => ({
      ...vote,
      cardLabel: room.isGameOver ? vote.cardLabel : undefined,
      cardValue: room.isGameOver ? vote.cardValue : undefined,
      cardIcon: room.isGameOver ? vote.cardIcon : undefined,
      hasVoted: !!vote.cardLabel,
    }));

    return {
      room,
      users,
      votes: sanitizedVotes,
    };
  },
});

// Get rooms for a user (placeholder for now)
export const getUserRooms = query({
  args: { userId: v.string() },
  handler: async () => {
    // This would need to track user sessions differently
    // For now, return empty array
    return [];
  },
});

// Update room activity
export const updateActivity = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, {
      lastActivityAt: Date.now(),
    });
  },
});

// Show cards
export const showCards = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, {
      isGameOver: true,
      lastActivityAt: Date.now(),
    });
  },
});

// Reset game
export const resetGame = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    // Update room
    await ctx.db.patch(args.roomId, {
      isGameOver: false,
      lastActivityAt: Date.now(),
    });

    // Delete all votes for this room
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
  },
});
