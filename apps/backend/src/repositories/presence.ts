import { query } from "../lib/db";

export interface Presence {
  id: string;
  roomId: string;
  userId: string;
  cursor?: { x: number; y: number };
  isActive: boolean;
  lastPing: number;
}

export interface UpdatePresenceData {
  cursor?: { x: number; y: number } | null;
  isActive?: boolean;
}

export async function updatePresence(
  roomId: string,
  userId: string,
  data: UpdatePresenceData = {}
): Promise<Presence> {
  const now = Date.now();

  const result = await query<Presence>(
    `INSERT INTO presence (room_id, user_id, cursor, is_active, last_ping)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (room_id, user_id) 
    DO UPDATE SET 
      cursor = COALESCE(EXCLUDED.cursor, presence.cursor),
      is_active = COALESCE(EXCLUDED.is_active, presence.is_active),
      last_ping = EXCLUDED.last_ping
    RETURNING 
      id, room_id as "roomId", user_id as "userId",
      cursor, is_active as "isActive", last_ping as "lastPing"`,
    [
      roomId,
      userId,
      data.cursor !== undefined ? JSON.stringify(data.cursor) : null,
      data.isActive ?? true,
      now,
    ]
  );

  return result.rows[0];
}

export async function getPresenceByRoom(roomId: string): Promise<Presence[]> {
  const result = await query<Presence>(
    `SELECT 
      id, room_id as "roomId", user_id as "userId",
      cursor, is_active as "isActive", last_ping as "lastPing"
    FROM presence 
    WHERE room_id = $1 AND is_active = true
    ORDER BY last_ping DESC`,
    [roomId]
  );

  return result.rows;
}

export async function getPresence(
  roomId: string,
  userId: string
): Promise<Presence | null> {
  const result = await query<Presence>(
    `SELECT 
      id, room_id as "roomId", user_id as "userId",
      cursor, is_active as "isActive", last_ping as "lastPing"
    FROM presence 
    WHERE room_id = $1 AND user_id = $2`,
    [roomId, userId]
  );

  return result.rows[0] || null;
}

export async function markUserInactive(
  roomId: string,
  userId: string
): Promise<void> {
  await query(
    "UPDATE presence SET is_active = false WHERE room_id = $1 AND user_id = $2",
    [roomId, userId]
  );
}

export async function deletePresence(
  roomId: string,
  userId: string
): Promise<boolean> {
  const result = await query(
    "DELETE FROM presence WHERE room_id = $1 AND user_id = $2",
    [roomId, userId]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function cleanupStalePresence(
  minutesThreshold: number = 5
): Promise<number> {
  const threshold = Date.now() - minutesThreshold * 60 * 1000;

  const result = await query("DELETE FROM presence WHERE last_ping < $1", [
    threshold,
  ]);

  return result.rowCount ?? 0;
}
