import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import * as Rooms from "./model/rooms";

// Create a new room
export const create = mutation({
  args: {
    name: v.string(),
    roomType: v.optional(v.literal("canvas")), // Optional, defaults to canvas
    votingCategorized: v.optional(v.boolean()),
    autoCompleteVoting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await Rooms.createRoom(ctx, args);
  },
});

// Get room with all related data
export const get = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await Rooms.getRoomWithRelatedData(ctx, args.roomId);
  },
});

// Get rooms for a user
export const getUserRooms = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await Rooms.getUserRooms(ctx, args.userId);
  },
});

// Update room activity
export const updateActivity = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    await Rooms.updateRoomActivity(ctx, args.roomId);
  },
});

// Show cards
export const showCards = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    await Rooms.showRoomCards(ctx, args.roomId);
  },
});

// Reset game
export const resetGame = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    await Rooms.resetRoomGame(ctx, args.roomId);
  },
});
