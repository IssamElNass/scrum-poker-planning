import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as Rooms from "./model/rooms";

// Create a new room
export const create = mutation({
  args: {
    name: v.string(),
    roomType: v.optional(v.literal("canvas")), // Optional, defaults to canvas
    votingCategorized: v.optional(v.boolean()),
    autoCompleteVoting: v.optional(v.boolean()),
    votingSystem: v.optional(
      v.union(
        v.literal("fibonacci"),
        v.literal("modified-fibonacci"),
        v.literal("tshirt"),
        v.literal("powers-of-2")
      )
    ),
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

// Update room name
export const updateName = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await Rooms.updateRoomName(ctx, args);
  },
});

// Check if user is room owner
export const isOwner = query({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await Rooms.isRoomOwner(ctx, args.roomId, args.userId);
  },
});

// Update room voting system
export const updateVotingSystem = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    votingSystem: v.union(
      v.literal("fibonacci"),
      v.literal("modified-fibonacci"),
      v.literal("tshirt"),
      v.literal("powers-of-2")
    ),
  },
  handler: async (ctx, args) => {
    await Rooms.updateRoomVotingSystem(ctx, args);
  },
});
