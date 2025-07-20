import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export interface CleanupResult {
  roomsDeleted: number;
  votesDeleted: number;
  usersDeleted: number;
  canvasNodesDeleted?: number;
  canvasStatesDeleted?: number;
  presenceDeleted?: number;
}

/**
 * Removes inactive rooms and all associated data
 * @param inactiveDays - Number of days of inactivity before a room is considered inactive
 */
export async function removeInactiveRooms(
  ctx: MutationCtx,
  inactiveDays: number = 5
): Promise<CleanupResult> {
  const cutoffTime = Date.now() - (inactiveDays * 24 * 60 * 60 * 1000);

  // Find inactive rooms
  const inactiveRooms = await ctx.db
    .query("rooms")
    .withIndex("by_activity", (q) => q.lt("lastActivityAt", cutoffTime))
    .collect();

  console.log(`Found ${inactiveRooms.length} inactive rooms to clean up`);

  const result: CleanupResult = {
    roomsDeleted: 0,
    votesDeleted: 0,
    usersDeleted: 0,
    canvasNodesDeleted: 0,
    canvasStatesDeleted: 0,
    presenceDeleted: 0,
  };

  // Process each room
  for (const room of inactiveRooms) {
    const cleanupStats = await cleanupRoom(ctx, room._id);
    
    // Aggregate stats
    result.votesDeleted += cleanupStats.votesDeleted;
    result.usersDeleted += cleanupStats.usersDeleted;
    result.canvasNodesDeleted! += cleanupStats.canvasNodesDeleted || 0;
    result.canvasStatesDeleted! += cleanupStats.canvasStatesDeleted || 0;
    result.presenceDeleted! += cleanupStats.presenceDeleted || 0;
    result.roomsDeleted++;

    console.log(`Cleaned up room ${room.name} (${room._id})`);
  }

  return result;
}

/**
 * Cleans up all data associated with a single room
 */
export async function cleanupRoom(
  ctx: MutationCtx,
  roomId: Id<"rooms">
): Promise<Omit<CleanupResult, "roomsDeleted">> {
  // Get all related data in parallel
  const [votes, users, canvasNodes, canvasStates, presence] = await Promise.all([
    ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect(),
    ctx.db
      .query("users")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect(),
    ctx.db
      .query("canvasNodes")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect(),
    ctx.db
      .query("canvasState")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect(),
    ctx.db
      .query("presence")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect(),
  ]);

  // Delete all related data in parallel
  const deletePromises: Promise<void>[] = [];

  // Delete votes
  deletePromises.push(...votes.map((vote) => ctx.db.delete(vote._id)));

  // Delete users
  deletePromises.push(...users.map((user) => ctx.db.delete(user._id)));

  // Delete canvas nodes
  deletePromises.push(...canvasNodes.map((node) => ctx.db.delete(node._id)));

  // Delete canvas states
  deletePromises.push(...canvasStates.map((state) => ctx.db.delete(state._id)));

  // Delete presence
  deletePromises.push(...presence.map((p) => ctx.db.delete(p._id)));

  // Wait for all deletions to complete
  await Promise.all(deletePromises);

  // Delete the room itself
  await ctx.db.delete(roomId);

  return {
    votesDeleted: votes.length,
    usersDeleted: users.length,
    canvasNodesDeleted: canvasNodes.length,
    canvasStatesDeleted: canvasStates.length,
    presenceDeleted: presence.length,
  };
}

/**
 * Removes orphaned data (data without associated rooms)
 */
export async function cleanupOrphanedData(ctx: MutationCtx): Promise<{
  orphanedVotes: number;
  orphanedUsers: number;
  orphanedCanvasNodes: number;
}> {
  let orphanedVotes = 0;
  let orphanedUsers = 0;
  let orphanedCanvasNodes = 0;

  // Check votes
  const votes = await ctx.db.query("votes").collect();
  for (const vote of votes) {
    const room = await ctx.db.get(vote.roomId);
    if (!room) {
      await ctx.db.delete(vote._id);
      orphanedVotes++;
    }
  }

  // Check users
  const users = await ctx.db.query("users").collect();
  for (const user of users) {
    const room = await ctx.db.get(user.roomId);
    if (!room) {
      await ctx.db.delete(user._id);
      orphanedUsers++;
    }
  }

  // Check canvas nodes
  const canvasNodes = await ctx.db.query("canvasNodes").collect();
  for (const node of canvasNodes) {
    const room = await ctx.db.get(node.roomId);
    if (!room) {
      await ctx.db.delete(node._id);
      orphanedCanvasNodes++;
    }
  }

  return {
    orphanedVotes,
    orphanedUsers,
    orphanedCanvasNodes,
  };
}