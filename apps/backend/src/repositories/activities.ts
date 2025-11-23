import { query } from "../lib/db";

export type ActivityType = "user_left" | "user_kicked";

export interface Activity {
  id: string;
  roomId: string;
  type: ActivityType;
  userName: string;
  createdAt: number;
}

export interface CreateActivityData {
  roomId: string;
  type: ActivityType;
  userName: string;
}

export async function createActivity(
  data: CreateActivityData
): Promise<Activity> {
  const now = Date.now();

  const result = await query<Activity>(
    `INSERT INTO activities (room_id, type, user_name, created_at)
    VALUES ($1, $2, $3, $4)
    RETURNING 
      id, room_id as "roomId", type, user_name as "userName",
      created_at as "createdAt"`,
    [data.roomId, data.type, data.userName, now]
  );

  return result.rows[0];
}

export async function getActivitiesByRoom(
  roomId: string,
  limit: number = 50
): Promise<Activity[]> {
  const result = await query<Activity>(
    `SELECT 
      id, room_id as "roomId", type, user_name as "userName",
      created_at as "createdAt"
    FROM activities 
    WHERE room_id = $1
    ORDER BY created_at DESC
    LIMIT $2`,
    [roomId, limit]
  );

  return result.rows;
}

export async function deleteActivitiesByRoom(roomId: string): Promise<number> {
  const result = await query("DELETE FROM activities WHERE room_id = $1", [
    roomId,
  ]);

  return result.rowCount ?? 0;
}
