import { query } from "../lib/db";

export type VotingSystem =
  | "fibonacci"
  | "modified-fibonacci"
  | "tshirt"
  | "powers-of-2";

export interface Room {
  id: string;
  name: string;
  votingCategorized: boolean;
  autoCompleteVoting: boolean;
  roomType: string;
  votingSystem: VotingSystem;
  isGameOver: boolean;
  createdAt: number;
  lastActivityAt: number;
  ownerId?: string;
  password?: string;
  activeStoryNodeId?: string;
}

export interface CreateRoomData {
  name: string;
  votingCategorized?: boolean;
  autoCompleteVoting?: boolean;
  roomType?: string;
  votingSystem?: VotingSystem;
  ownerId?: string;
  password?: string;
}

export interface UpdateRoomData {
  name?: string;
  votingCategorized?: boolean;
  autoCompleteVoting?: boolean;
  votingSystem?: VotingSystem;
  isGameOver?: boolean;
  activeStoryNodeId?: string;
  password?: string;
}

export async function createRoom(data: CreateRoomData): Promise<Room> {
  const now = Date.now();

  const result = await query<Room>(
    `INSERT INTO rooms (
      name, voting_categorized, auto_complete_voting, room_type, 
      voting_system, is_game_over, created_at, last_activity_at, 
      owner_id, password
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING 
      id, name, voting_categorized as "votingCategorized", 
      auto_complete_voting as "autoCompleteVoting", room_type as "roomType",
      voting_system as "votingSystem", is_game_over as "isGameOver",
      created_at as "createdAt", last_activity_at as "lastActivityAt",
      owner_id as "ownerId", password, active_story_node_id as "activeStoryNodeId"`,
    [
      data.name,
      data.votingCategorized ?? false,
      data.autoCompleteVoting ?? false,
      data.roomType ?? "canvas",
      data.votingSystem ?? "fibonacci",
      false, // isGameOver
      now,
      now,
      data.ownerId ?? null,
      data.password ?? null,
    ]
  );

  return result.rows[0];
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  const result = await query<Room>(
    `SELECT 
      id, name, voting_categorized as "votingCategorized", 
      auto_complete_voting as "autoCompleteVoting", room_type as "roomType",
      voting_system as "votingSystem", is_game_over as "isGameOver",
      created_at as "createdAt", last_activity_at as "lastActivityAt",
      owner_id as "ownerId", password, active_story_node_id as "activeStoryNodeId"
    FROM rooms WHERE id = $1`,
    [roomId]
  );

  return result.rows[0] || null;
}

export async function updateRoom(
  roomId: string,
  data: UpdateRoomData
): Promise<Room | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.votingCategorized !== undefined) {
    updates.push(`voting_categorized = $${paramIndex++}`);
    values.push(data.votingCategorized);
  }
  if (data.autoCompleteVoting !== undefined) {
    updates.push(`auto_complete_voting = $${paramIndex++}`);
    values.push(data.autoCompleteVoting);
  }
  if (data.votingSystem !== undefined) {
    updates.push(`voting_system = $${paramIndex++}`);
    values.push(data.votingSystem);
  }
  if (data.isGameOver !== undefined) {
    updates.push(`is_game_over = $${paramIndex++}`);
    values.push(data.isGameOver);
  }
  if (data.activeStoryNodeId !== undefined) {
    updates.push(`active_story_node_id = $${paramIndex++}`);
    values.push(data.activeStoryNodeId);
  }
  if (data.password !== undefined) {
    updates.push(`password = $${paramIndex++}`);
    values.push(data.password);
  }

  // Always update lastActivityAt
  updates.push(`last_activity_at = $${paramIndex++}`);
  values.push(Date.now());

  if (updates.length === 1) {
    // Only lastActivityAt was updated
    return getRoomById(roomId);
  }

  values.push(roomId);

  const result = await query<Room>(
    `UPDATE rooms 
    SET ${updates.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING 
      id, name, voting_categorized as "votingCategorized", 
      auto_complete_voting as "autoCompleteVoting", room_type as "roomType",
      voting_system as "votingSystem", is_game_over as "isGameOver",
      created_at as "createdAt", last_activity_at as "lastActivityAt",
      owner_id as "ownerId", password, active_story_node_id as "activeStoryNodeId"`,
    values
  );

  return result.rows[0] || null;
}

export async function deleteRoom(roomId: string): Promise<boolean> {
  const result = await query("DELETE FROM rooms WHERE id = $1", [roomId]);

  return (result.rowCount ?? 0) > 0;
}

export async function updateRoomActivity(roomId: string): Promise<void> {
  await query("UPDATE rooms SET last_activity_at = $1 WHERE id = $2", [
    Date.now(),
    roomId,
  ]);
}

export async function getRecentRooms(limit: number = 10): Promise<Room[]> {
  const result = await query<Room>(
    `SELECT 
      id, name, voting_categorized as "votingCategorized", 
      auto_complete_voting as "autoCompleteVoting", room_type as "roomType",
      voting_system as "votingSystem", is_game_over as "isGameOver",
      created_at as "createdAt", last_activity_at as "lastActivityAt",
      owner_id as "ownerId", active_story_node_id as "activeStoryNodeId"
    FROM rooms 
    ORDER BY created_at DESC 
    LIMIT $1`,
    [limit]
  );

  return result.rows;
}

export async function getRoomsByOwner(ownerId: string): Promise<Room[]> {
  const result = await query<Room>(
    `SELECT 
      id, name, voting_categorized as "votingCategorized", 
      auto_complete_voting as "autoCompleteVoting", room_type as "roomType",
      voting_system as "votingSystem", is_game_over as "isGameOver",
      created_at as "createdAt", last_activity_at as "lastActivityAt",
      owner_id as "ownerId", active_story_node_id as "activeStoryNodeId"
    FROM rooms 
    WHERE owner_id = $1
    ORDER BY created_at DESC`,
    [ownerId]
  );

  return result.rows;
}
