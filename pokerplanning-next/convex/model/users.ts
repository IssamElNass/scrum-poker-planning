import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import * as Canvas from "./canvas";
import * as Rooms from "./rooms";

export interface JoinRoomArgs {
  roomId: Id<"rooms">;
  name: string;
  isSpectator?: boolean;
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
  // Update room activity
  await Rooms.updateRoomActivity(ctx, args.roomId);

  // Create user
  const userId = await ctx.db.insert("users", {
    roomId: args.roomId,
    name: args.name,
    isSpectator: args.isSpectator ?? false,
    joinedAt: Date.now(),
  });

  // Check if this is a canvas room and create nodes
  const room = await ctx.db.get(args.roomId);
  if (room && room.roomType === "canvas") {
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
  if (!user) throw new Error("User not found");

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

  // Perform all cleanup operations in parallel for better performance
  const cleanupPromises: Promise<void>[] = [];

  // Delete user's votes
  const votes = await ctx.db
    .query("votes")
    .withIndex("by_room_user", (q) =>
      q.eq("roomId", user.roomId).eq("userId", userId)
    )
    .collect();

  cleanupPromises.push(...votes.map((vote) => ctx.db.delete(vote._id)));

  // Check if this is a canvas room and remove nodes
  const room = await ctx.db.get(user.roomId);
  if (room && room.roomType === "canvas") {
    // Remove player node and voting cards
    cleanupPromises.push(
      Canvas.removePlayerNodeAndCards(ctx, { roomId: user.roomId, userId })
    );

    // Mark user as inactive in presence
    cleanupPromises.push(
      Canvas.markUserInactive(ctx, { roomId: user.roomId, userId })
    );
  }

  // Wait for all cleanup operations to complete
  await Promise.all(cleanupPromises);

  // Delete user
  await ctx.db.delete(userId);

  // Update room activity
  await Rooms.updateRoomActivity(ctx, user.roomId);
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
