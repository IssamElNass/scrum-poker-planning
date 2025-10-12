import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import * as Canvas from "./canvas";
import * as Rooms from "./rooms";
import { verifyPassword, hashPassword } from "../lib/password";

export interface JoinRoomArgs {
  roomId: Id<"rooms">;
  name: string;
  isSpectator?: boolean;
  password?: string;
}

export interface EditUserArgs {
  userId: Id<"users">;
  name?: string;
  isSpectator?: boolean;
}

/**
 * Adds a user to a room
 */
export async function joinRoom(
  ctx: MutationCtx,
  args: JoinRoomArgs
): Promise<Id<"users">> {
  // Parallelize room and user queries for better performance
  const [room, existingUsers] = await Promise.all([
    ctx.db.get(args.roomId),
    ctx.db
      .query("users")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect(),
  ]);

  if (!room) {
    throw new ConvexError("Room not found");
  }

  const isFirstUser = existingUsers.length === 0;

  // Validate password for non-first users
  if (!isFirstUser && room.password) {
    if (
      !args.password ||
      !(await verifyPassword(args.password, room.password))
    ) {
      throw new ConvexError("Incorrect password");
    }
  }

  // Prepare room patches
  const roomPatches: Partial<{
    password: string;
    lastActivityAt: number;
    ownerId: Id<"users">;
  }> = { lastActivityAt: Date.now() };

  // If this is the first user and they provided a password, hash and set it
  if (isFirstUser && args.password && args.password.trim()) {
    roomPatches.password = await hashPassword(args.password.trim());
  }

  // Create user
  const userId = await ctx.db.insert("users", {
    roomId: args.roomId,
    name: args.name,
    isSpectator: args.isSpectator ?? false,
    joinedAt: Date.now(),
  });

  // Set as room owner if this is the first user
  if (isFirstUser) {
    roomPatches.ownerId = userId;
  }

  // Batch room updates into a single patch operation
  await ctx.db.patch(args.roomId, roomPatches);

  // Check if this is a canvas room and create nodes
  if (room.roomType === "canvas") {
    // Create player node
    await Canvas.upsertPlayerNode(ctx, { roomId: args.roomId, userId });

    // Create voting card nodes for non-spectators
    if (!(args.isSpectator ?? false)) {
      await Canvas.createVotingCardNodes(ctx, { roomId: args.roomId, userId });
    }
  }

  return userId;
}

/**
 * Updates user information
 */
export async function editUser(
  ctx: MutationCtx,
  args: EditUserArgs
): Promise<void> {
  const user = await ctx.db.get(args.userId);
  if (!user) throw new ConvexError("User not found");

  // Update room activity
  await Rooms.updateRoomActivity(ctx, user.roomId);

  // Build update object with only provided fields
  const updates: Partial<{ name: string; isSpectator: boolean }> = {};
  if (args.name !== undefined) updates.name = args.name;
  if (args.isSpectator !== undefined) updates.isSpectator = args.isSpectator;

  // Update user if there are changes
  if (Object.keys(updates).length > 0) {
    await ctx.db.patch(args.userId, updates);
  }

  // TODO: Handle spectator mode change for canvas rooms
  // If user changes from player to spectator or vice versa,
  // we might need to add/remove voting card nodes
}

/**
 * Removes a user from a room and cleans up related data
 */
export async function leaveRoom(
  ctx: MutationCtx,
  userId: Id<"users">
): Promise<void> {
  const user = await ctx.db.get(userId);
  if (!user) return;

  const roomId = user.roomId;
  const userName = user.name;

  // Get remaining users before deleting this one
  const allUsers = await ctx.db
    .query("users")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .collect();

  // Perform all cleanup operations in parallel for better performance
  const cleanupPromises: Promise<void>[] = [];

  // Delete user's votes
  const votes = await ctx.db
    .query("votes")
    .withIndex("by_room_user", (q) =>
      q.eq("roomId", roomId).eq("userId", userId)
    )
    .collect();

  cleanupPromises.push(...votes.map((vote) => ctx.db.delete(vote._id)));

  // Check if this is a canvas room and remove nodes
  const room = await ctx.db.get(roomId);
  if (room && room.roomType === "canvas") {
    // Remove player node and voting cards
    cleanupPromises.push(
      Canvas.removePlayerNodeAndCards(ctx, { roomId, userId })
    );

    // Mark user as inactive in presence
    cleanupPromises.push(Canvas.markUserInactive(ctx, { roomId, userId }));
  }

  // Wait for all cleanup operations to complete
  await Promise.all(cleanupPromises);

  // Create activity log for user leaving
  await ctx.db.insert("activities", {
    roomId,
    type: "user_left",
    userName,
    createdAt: Date.now(),
  });

  // Delete user
  await ctx.db.delete(userId);

  // Handle ownership transfer if necessary
  const remainingUsers = allUsers.filter((u) => u._id !== userId);

  if (room && room.ownerId === userId && remainingUsers.length > 0) {
    // Transfer ownership to the next oldest user
    const nextOwner = remainingUsers.sort((a, b) => a.joinedAt - b.joinedAt)[0];
    await ctx.db.patch(roomId, {
      ownerId: nextOwner._id,
    });
  }

  // Update room activity
  await Rooms.updateRoomActivity(ctx, roomId);
}

/**
 * Gets all users in a room
 */
export async function getRoomUsers(ctx: MutationCtx, roomId: Id<"rooms">) {
  return await ctx.db
    .query("users")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .collect();
}

/**
 * Checks if a user name is already taken in a room
 */
export async function isUserNameTaken(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  name: string
): Promise<boolean> {
  const users = await getRoomUsers(ctx, roomId);
  return users.some((user) => user.name.toLowerCase() === name.toLowerCase());
}

/**
 * Kicks a user from the room (only by room owner)
 */
export async function kickUser(
  ctx: MutationCtx,
  args: {
    roomId: Id<"rooms">;
    userToKickId: Id<"users">;
    kickedById: Id<"users">;
  }
): Promise<void> {
  const room = await ctx.db.get(args.roomId);
  if (!room) {
    throw new ConvexError("Room not found");
  }

  const kickedBy = await ctx.db.get(args.kickedById);
  if (!kickedBy || kickedBy.roomId !== args.roomId) {
    throw new ConvexError("Kicker not found in room");
  }

  const userToKick = await ctx.db.get(args.userToKickId);
  if (!userToKick || userToKick.roomId !== args.roomId) {
    throw new ConvexError("User to kick not found in room");
  }

  // Check if kicker is room owner
  const isOwner = await Rooms.isRoomOwner(ctx, args.roomId, args.kickedById);
  if (!isOwner) {
    throw new ConvexError("Only room owner can kick users");
  }

  // Cannot kick yourself
  if (args.userToKickId === args.kickedById) {
    throw new ConvexError("Cannot kick yourself");
  }

  // Cannot kick the room owner
  if (room.ownerId === args.userToKickId) {
    throw new ConvexError("Cannot kick the room owner");
  }

  // Create activity log for user being kicked
  await ctx.db.insert("activities", {
    roomId: args.roomId,
    type: "user_kicked",
    userName: userToKick.name,
    createdAt: Date.now(),
  });

  // Delete user
  await ctx.db.delete(args.userToKickId);

  // Delete related votes
  const userVotes = await ctx.db
    .query("votes")
    .withIndex("by_user", (q) => q.eq("userId", args.userToKickId))
    .collect();

  await Promise.all(userVotes.map((vote) => ctx.db.delete(vote._id)));

  // Delete related canvas nodes
  const userNodes = await ctx.db
    .query("canvasNodes")
    .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
    .filter((q) =>
      q.or(
        q.eq(q.field("nodeId"), `player-${args.userToKickId}`),
        q.eq(q.field("lastUpdatedBy"), args.userToKickId)
      )
    )
    .collect();

  await Promise.all(userNodes.map((node) => ctx.db.delete(node._id)));

  // Update room activity
  await Rooms.updateRoomActivity(ctx, args.roomId);
}

/**
 * Transfers room ownership to another user
 */
export async function transferOwnership(
  ctx: MutationCtx,
  args: {
    roomId: Id<"rooms">;
    newOwnerId: Id<"users">;
    currentOwnerId: Id<"users">;
  }
): Promise<void> {
  const room = await ctx.db.get(args.roomId);
  if (!room) {
    throw new ConvexError("Room not found");
  }

  const currentOwner = await ctx.db.get(args.currentOwnerId);
  if (!currentOwner || currentOwner.roomId !== args.roomId) {
    throw new ConvexError("Current owner not found in room");
  }

  const newOwner = await ctx.db.get(args.newOwnerId);
  if (!newOwner || newOwner.roomId !== args.roomId) {
    throw new ConvexError("New owner not found in room");
  }

  // Check if current user is room owner
  const isOwner = await Rooms.isRoomOwner(
    ctx,
    args.roomId,
    args.currentOwnerId
  );
  if (!isOwner) {
    throw new ConvexError("Only room owner can transfer ownership");
  }

  // Cannot transfer to yourself
  if (args.newOwnerId === args.currentOwnerId) {
    throw new ConvexError("Cannot transfer ownership to yourself");
  }

  // Update room owner
  await ctx.db.patch(args.roomId, {
    ownerId: args.newOwnerId,
    lastActivityAt: Date.now(),
  });
}
