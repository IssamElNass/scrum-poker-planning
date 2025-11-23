import { query } from "../lib/db";

export interface Vote {
  id: string;
  roomId: string;
  userId: string;
  cardLabel?: string;
  cardValue?: number;
  cardIcon?: string;
}

export interface CreateVoteData {
  roomId: string;
  userId: string;
  cardLabel?: string;
  cardValue?: number;
  cardIcon?: string;
}

export interface UpdateVoteData {
  cardLabel?: string;
  cardValue?: number;
  cardIcon?: string;
}

export async function castVote(data: CreateVoteData): Promise<Vote> {
  // Use UPSERT to handle both create and update
  const result = await query<Vote>(
    `INSERT INTO votes (room_id, user_id, card_label, card_value, card_icon)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (room_id, user_id) 
    DO UPDATE SET 
      card_label = EXCLUDED.card_label,
      card_value = EXCLUDED.card_value,
      card_icon = EXCLUDED.card_icon
    RETURNING 
      id, room_id as "roomId", user_id as "userId",
      card_label as "cardLabel", card_value as "cardValue", 
      card_icon as "cardIcon"`,
    [
      data.roomId,
      data.userId,
      data.cardLabel ?? null,
      data.cardValue ?? null,
      data.cardIcon ?? null,
    ]
  );

  return result.rows[0];
}

export async function getVoteByRoomAndUser(
  roomId: string,
  userId: string
): Promise<Vote | null> {
  const result = await query<Vote>(
    `SELECT 
      id, room_id as "roomId", user_id as "userId",
      card_label as "cardLabel", card_value as "cardValue", 
      card_icon as "cardIcon"
    FROM votes 
    WHERE room_id = $1 AND user_id = $2`,
    [roomId, userId]
  );

  return result.rows[0] || null;
}

export async function getVotesByRoom(roomId: string): Promise<Vote[]> {
  const result = await query<Vote>(
    `SELECT 
      id, room_id as "roomId", user_id as "userId",
      card_label as "cardLabel", card_value as "cardValue", 
      card_icon as "cardIcon"
    FROM votes 
    WHERE room_id = $1`,
    [roomId]
  );

  return result.rows;
}

export async function getVotesByUser(userId: string): Promise<Vote[]> {
  const result = await query<Vote>(
    `SELECT 
      id, room_id as "roomId", user_id as "userId",
      card_label as "cardLabel", card_value as "cardValue", 
      card_icon as "cardIcon"
    FROM votes 
    WHERE user_id = $1`,
    [userId]
  );

  return result.rows;
}

export async function clearVotesByRoom(roomId: string): Promise<number> {
  const result = await query("DELETE FROM votes WHERE room_id = $1", [roomId]);

  return result.rowCount ?? 0;
}

export async function deleteVote(
  roomId: string,
  userId: string
): Promise<boolean> {
  const result = await query(
    "DELETE FROM votes WHERE room_id = $1 AND user_id = $2",
    [roomId, userId]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function getVoteCount(roomId: string): Promise<number> {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*) as count FROM votes WHERE room_id = $1",
    [roomId]
  );

  return parseInt(result.rows[0].count, 10);
}
