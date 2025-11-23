import { query } from "../lib/db";

export type ReactionType =
  | "thumbsUp"
  | "heart"
  | "clap"
  | "fire"
  | "thinking"
  | "party";

export interface User {
  id: string;
  roomId: string;
  name: string;
  isSpectator: boolean;
  joinedAt: number;
  lastReactionType?: ReactionType;
  lastReactionAt?: number;
}

export interface CreateUserData {
  roomId: string;
  name: string;
  isSpectator?: boolean;
}

export interface UpdateUserData {
  name?: string;
  isSpectator?: boolean;
  lastReactionType?: ReactionType | null;
  lastReactionAt?: number | null;
}

export async function createUser(data: CreateUserData): Promise<User> {
  const now = Date.now();

  const result = await query<User>(
    `INSERT INTO users (room_id, name, is_spectator, joined_at)
    VALUES ($1, $2, $3, $4)
    RETURNING 
      id, room_id as "roomId", name, is_spectator as "isSpectator",
      joined_at as "joinedAt", last_reaction_type as "lastReactionType",
      last_reaction_at as "lastReactionAt"`,
    [data.roomId, data.name, data.isSpectator ?? false, now]
  );

  return result.rows[0];
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT 
      id, room_id as "roomId", name, is_spectator as "isSpectator",
      joined_at as "joinedAt", last_reaction_type as "lastReactionType",
      last_reaction_at as "lastReactionAt"
    FROM users WHERE id = $1`,
    [userId]
  );

  return result.rows[0] || null;
}

export async function getUsersByRoom(roomId: string): Promise<User[]> {
  const result = await query<User>(
    `SELECT 
      id, room_id as "roomId", name, is_spectator as "isSpectator",
      joined_at as "joinedAt", last_reaction_type as "lastReactionType",
      last_reaction_at as "lastReactionAt"
    FROM users 
    WHERE room_id = $1
    ORDER BY joined_at ASC`,
    [roomId]
  );

  return result.rows;
}

export async function updateUser(
  userId: string,
  data: UpdateUserData
): Promise<User | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.isSpectator !== undefined) {
    updates.push(`is_spectator = $${paramIndex++}`);
    values.push(data.isSpectator);
  }
  if (data.lastReactionType !== undefined) {
    updates.push(`last_reaction_type = $${paramIndex++}`);
    values.push(data.lastReactionType);
  }
  if (data.lastReactionAt !== undefined) {
    updates.push(`last_reaction_at = $${paramIndex++}`);
    values.push(data.lastReactionAt);
  }

  if (updates.length === 0) {
    return getUserById(userId);
  }

  values.push(userId);

  const result = await query<User>(
    `UPDATE users 
    SET ${updates.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING 
      id, room_id as "roomId", name, is_spectator as "isSpectator",
      joined_at as "joinedAt", last_reaction_type as "lastReactionType",
      last_reaction_at as "lastReactionAt"`,
    values
  );

  return result.rows[0] || null;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const result = await query("DELETE FROM users WHERE id = $1", [userId]);

  return (result.rowCount ?? 0) > 0;
}

export async function deleteUsersByRoom(roomId: string): Promise<number> {
  const result = await query("DELETE FROM users WHERE room_id = $1", [roomId]);

  return result.rowCount ?? 0;
}

export async function getUserCount(roomId: string): Promise<number> {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*) as count FROM users WHERE room_id = $1",
    [roomId]
  );

  return parseInt(result.rows[0].count, 10);
}
