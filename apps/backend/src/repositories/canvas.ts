import { query } from "../lib/db";

export type NodeType =
  | "player"
  | "session"
  | "timer"
  | "votingCard"
  | "results"
  | "story";

export interface CanvasNode {
  id: string;
  roomId: string;
  nodeId: string;
  type: NodeType;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  isLocked?: boolean;
  lastUpdatedBy?: string;
  lastUpdatedAt: number;
}

export interface CanvasState {
  id: string;
  roomId: string;
  userId: string;
  viewport: { x: number; y: number; zoom: number };
  lastUpdatedAt: number;
}

export interface CreateCanvasNodeData {
  roomId: string;
  nodeId: string;
  type: NodeType;
  position: { x: number; y: number };
  data?: Record<string, unknown>;
  isLocked?: boolean;
  lastUpdatedBy?: string;
}

export interface UpdateCanvasNodeData {
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
  isLocked?: boolean;
  lastUpdatedBy?: string;
}

// Canvas Nodes
export async function createCanvasNode(
  data: CreateCanvasNodeData
): Promise<CanvasNode> {
  const now = Date.now();

  const result = await query<CanvasNode>(
    `INSERT INTO canvas_nodes (
      room_id, node_id, type, position, data, is_locked, 
      last_updated_by, last_updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (room_id, node_id) 
    DO UPDATE SET 
      position = EXCLUDED.position,
      data = EXCLUDED.data,
      is_locked = EXCLUDED.is_locked,
      last_updated_by = EXCLUDED.last_updated_by,
      last_updated_at = EXCLUDED.last_updated_at
    RETURNING 
      id, room_id as "roomId", node_id as "nodeId", type,
      position, data, is_locked as "isLocked",
      last_updated_by as "lastUpdatedBy", last_updated_at as "lastUpdatedAt"`,
    [
      data.roomId,
      data.nodeId,
      data.type,
      JSON.stringify(data.position),
      JSON.stringify(data.data ?? {}),
      data.isLocked ?? false,
      data.lastUpdatedBy ?? null,
      now,
    ]
  );

  return result.rows[0];
}

export async function getCanvasNodesByRoom(
  roomId: string
): Promise<CanvasNode[]> {
  const result = await query<CanvasNode>(
    `SELECT 
      id, room_id as "roomId", node_id as "nodeId", type,
      position, data, is_locked as "isLocked",
      last_updated_by as "lastUpdatedBy", last_updated_at as "lastUpdatedAt"
    FROM canvas_nodes 
    WHERE room_id = $1
    ORDER BY last_updated_at ASC`,
    [roomId]
  );

  return result.rows;
}

export async function getCanvasNode(
  roomId: string,
  nodeId: string
): Promise<CanvasNode | null> {
  const result = await query<CanvasNode>(
    `SELECT 
      id, room_id as "roomId", node_id as "nodeId", type,
      position, data, is_locked as "isLocked",
      last_updated_by as "lastUpdatedBy", last_updated_at as "lastUpdatedAt"
    FROM canvas_nodes 
    WHERE room_id = $1 AND node_id = $2`,
    [roomId, nodeId]
  );

  return result.rows[0] || null;
}

export async function updateCanvasNode(
  roomId: string,
  nodeId: string,
  data: UpdateCanvasNodeData
): Promise<CanvasNode | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.position !== undefined) {
    updates.push(`position = $${paramIndex++}`);
    values.push(JSON.stringify(data.position));
  }
  if (data.data !== undefined) {
    updates.push(`data = $${paramIndex++}`);
    values.push(JSON.stringify(data.data));
  }
  if (data.isLocked !== undefined) {
    updates.push(`is_locked = $${paramIndex++}`);
    values.push(data.isLocked);
  }
  if (data.lastUpdatedBy !== undefined) {
    updates.push(`last_updated_by = $${paramIndex++}`);
    values.push(data.lastUpdatedBy);
  }

  // Always update timestamp
  updates.push(`last_updated_at = $${paramIndex++}`);
  values.push(Date.now());

  if (updates.length === 1) {
    // Only timestamp was updated
    return getCanvasNode(roomId, nodeId);
  }

  values.push(roomId, nodeId);

  const result = await query<CanvasNode>(
    `UPDATE canvas_nodes 
    SET ${updates.join(", ")}
    WHERE room_id = $${paramIndex++} AND node_id = $${paramIndex}
    RETURNING 
      id, room_id as "roomId", node_id as "nodeId", type,
      position, data, is_locked as "isLocked",
      last_updated_by as "lastUpdatedBy", last_updated_at as "lastUpdatedAt"`,
    values
  );

  return result.rows[0] || null;
}

export async function deleteCanvasNode(
  roomId: string,
  nodeId: string
): Promise<boolean> {
  const result = await query(
    "DELETE FROM canvas_nodes WHERE room_id = $1 AND node_id = $2",
    [roomId, nodeId]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function deleteCanvasNodesByRoom(roomId: string): Promise<number> {
  const result = await query("DELETE FROM canvas_nodes WHERE room_id = $1", [
    roomId,
  ]);

  return result.rowCount ?? 0;
}

// Canvas State (Viewport)
export async function saveCanvasState(
  roomId: string,
  userId: string,
  viewport: { x: number; y: number; zoom: number }
): Promise<CanvasState> {
  const now = Date.now();

  const result = await query<CanvasState>(
    `INSERT INTO canvas_state (room_id, user_id, viewport, last_updated_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (room_id, user_id) 
    DO UPDATE SET 
      viewport = EXCLUDED.viewport,
      last_updated_at = EXCLUDED.last_updated_at
    RETURNING 
      id, room_id as "roomId", user_id as "userId",
      viewport, last_updated_at as "lastUpdatedAt"`,
    [roomId, userId, JSON.stringify(viewport), now]
  );

  return result.rows[0];
}

export async function getCanvasState(
  roomId: string,
  userId: string
): Promise<CanvasState | null> {
  const result = await query<CanvasState>(
    `SELECT 
      id, room_id as "roomId", user_id as "userId",
      viewport, last_updated_at as "lastUpdatedAt"
    FROM canvas_state 
    WHERE room_id = $1 AND user_id = $2`,
    [roomId, userId]
  );

  return result.rows[0] || null;
}
