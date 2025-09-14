import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import * as Canvas from "./canvas";

export interface CreateRoomArgs {
  name: string;
  roomType?: "canvas"; // Optional, defaults to canvas
  votingCategorized?: boolean;
  autoCompleteVoting?: boolean;
}

export interface SanitizedVote extends Doc<"votes"> {
  hasVoted: boolean;
}

export interface RoomWithRelatedData {
  room: Doc<"rooms">;
  users: Doc<"users">[];
  votes: SanitizedVote[];
}

/**
 * Creates a new room with the specified configuration
 */
export async function createRoom(
  ctx: MutationCtx,
  args: CreateRoomArgs
): Promise<Id<"rooms">> {
  const roomId = await ctx.db.insert("rooms", {
    name: args.name,
    roomType: "canvas", // Always canvas now
    votingCategorized: args.votingCategorized ?? true,
    autoCompleteVoting: args.autoCompleteVoting ?? false,
    isGameOver: false,
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
  });

  // Always initialize canvas nodes
  await Canvas.initializeCanvasNodes(ctx, { roomId });

  return roomId;
}

/**
 * Fetches a room with all related data (users and votes)
 */
export async function getRoomWithRelatedData(
  ctx: QueryCtx,
  roomId: Id<"rooms">
): Promise<RoomWithRelatedData | null> {
  const room = await ctx.db.get(roomId);
  if (!room) return null;

  // Get all users and votes in parallel for better performance
  const [users, votes] = await Promise.all([
    ctx.db
      .query("users")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect(),
    ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect(),
  ]);

  // Sanitize votes based on game state
  const sanitizedVotes = sanitizeVotes(votes, room.isGameOver);

  return {
    room,
    users,
    votes: sanitizedVotes,
  };
}

/**
 * Sanitizes vote data based on game state
 * Hides card values when the game is not over
 */
export function sanitizeVotes(
  votes: Doc<"votes">[],
  isGameOver: boolean
): SanitizedVote[] {
  return votes.map((vote) => ({
    ...vote,
    cardLabel: isGameOver ? vote.cardLabel : undefined,
    cardValue: isGameOver ? vote.cardValue : undefined,
    cardIcon: isGameOver ? vote.cardIcon : undefined,
    hasVoted: !!vote.cardLabel,
  }));
}

/**
 * Updates room activity timestamp
 */
export async function updateRoomActivity(
  ctx: MutationCtx,
  roomId: Id<"rooms">
): Promise<void> {
  await ctx.db.patch(roomId, {
    lastActivityAt: Date.now(),
  });
}

/**
 * Reveals all cards in the room
 */
export async function showRoomCards(
  ctx: MutationCtx,
  roomId: Id<"rooms">
): Promise<void> {
  await ctx.db.patch(roomId, {
    isGameOver: true,
    lastActivityAt: Date.now(),
  });

  // Create results node for canvas rooms
  const room = await ctx.db.get(roomId);
  if (room && room.roomType === "canvas") {
    await Canvas.upsertResultsNode(ctx, { roomId });
  }
}

/**
 * Resets the game, clearing all votes
 */
export async function resetRoomGame(
  ctx: MutationCtx,
  roomId: Id<"rooms">
): Promise<void> {
  // Update room state
  await ctx.db.patch(roomId, {
    isGameOver: false,
    lastActivityAt: Date.now(),
  });

  // Delete all votes for this room in a more efficient way
  const votes = await ctx.db
    .query("votes")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .collect();

  // Use Promise.all for parallel deletion
  await Promise.all(votes.map((vote) => ctx.db.delete(vote._id)));
}

/**
 * Gets rooms for a specific user
 * TODO: Implement proper user session tracking
 */
export async function getUserRooms(
  _ctx: QueryCtx,
  _userId: string
): Promise<Doc<"rooms">[]> {
  // This would need to track user sessions differently
  // For now, return empty array
  return [];
}

/**
 * Updates room name (only by room owner)
 */
export async function updateRoomName(
  ctx: MutationCtx,
  args: {
    roomId: Id<"rooms">;
    userId: Id<"users">;
    name: string;
  }
): Promise<void> {
  const room = await ctx.db.get(args.roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  const user = await ctx.db.get(args.userId);
  if (!user || user.roomId !== args.roomId) {
    throw new Error("User not found in room");
  }

  // Check if user is room owner
  const isOwner = await isRoomOwner(ctx, args.roomId, args.userId);
  if (!isOwner) {
    throw new Error("Only room owner can change room name");
  }

  // Validate room name
  if (!args.name.trim()) {
    throw new Error("Room name cannot be empty");
  }

  // Update room name
  await ctx.db.patch(args.roomId, {
    name: args.name.trim(),
    lastActivityAt: Date.now(),
  });
}

/**
 * Checks if a user is the room owner
 */
export async function isRoomOwner(
  ctx: QueryCtx,
  roomId: Id<"rooms">,
  userId: Id<"users">
): Promise<boolean> {
  const room = await ctx.db.get(roomId);
  if (!room) return false;

  // If room has explicit owner, check that
  if (room.ownerId) {
    return room.ownerId === userId;
  }

  // Otherwise, check if this is the first user who joined
  const allUsers = await ctx.db
    .query("users")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .collect();

  if (allUsers.length === 0) return false;

  // Sort by join time and check if this user is first
  const sortedUsers = allUsers.sort((a, b) => a.joinedAt - b.joinedAt);
  return sortedUsers[0]._id === userId;
}
