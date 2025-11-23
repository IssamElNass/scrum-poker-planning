import { query } from "../lib/db";

export type IntegrationType = "github" | "jira" | "trello";

export interface Integration {
  id: string;
  roomId: string;
  type: IntegrationType;
  encryptedCredentials: string;
  config: Record<string, unknown>;
  connectedAt: number;
}

export interface CreateIntegrationData {
  roomId: string;
  type: IntegrationType;
  encryptedCredentials: string;
  config?: Record<string, unknown>;
}

export interface UpdateIntegrationData {
  encryptedCredentials?: string;
  config?: Record<string, unknown>;
}

export async function createIntegration(
  data: CreateIntegrationData
): Promise<Integration> {
  const now = Date.now();

  const result = await query<Integration>(
    `INSERT INTO integrations (room_id, type, encrypted_credentials, config, connected_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING 
      id, room_id as "roomId", type, encrypted_credentials as "encryptedCredentials",
      config, connected_at as "connectedAt"`,
    [
      data.roomId,
      data.type,
      data.encryptedCredentials,
      JSON.stringify(data.config ?? {}),
      now,
    ]
  );

  return result.rows[0];
}

export async function getIntegrationsByRoom(
  roomId: string
): Promise<Integration[]> {
  const result = await query<Integration>(
    `SELECT 
      id, room_id as "roomId", type, encrypted_credentials as "encryptedCredentials",
      config, connected_at as "connectedAt"
    FROM integrations 
    WHERE room_id = $1
    ORDER BY connected_at DESC`,
    [roomId]
  );

  return result.rows;
}

export async function getIntegration(
  roomId: string,
  type: IntegrationType
): Promise<Integration | null> {
  const result = await query<Integration>(
    `SELECT 
      id, room_id as "roomId", type, encrypted_credentials as "encryptedCredentials",
      config, connected_at as "connectedAt"
    FROM integrations 
    WHERE room_id = $1 AND type = $2`,
    [roomId, type]
  );

  return result.rows[0] || null;
}

export async function updateIntegration(
  id: string,
  data: UpdateIntegrationData
): Promise<Integration | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.encryptedCredentials !== undefined) {
    updates.push(`encrypted_credentials = $${paramIndex++}`);
    values.push(data.encryptedCredentials);
  }
  if (data.config !== undefined) {
    updates.push(`config = $${paramIndex++}`);
    values.push(JSON.stringify(data.config));
  }

  if (updates.length === 0) {
    return null;
  }

  values.push(id);

  const result = await query<Integration>(
    `UPDATE integrations 
    SET ${updates.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING 
      id, room_id as "roomId", type, encrypted_credentials as "encryptedCredentials",
      config, connected_at as "connectedAt"`,
    values
  );

  return result.rows[0] || null;
}

export async function deleteIntegration(id: string): Promise<boolean> {
  const result = await query("DELETE FROM integrations WHERE id = $1", [id]);

  return (result.rowCount ?? 0) > 0;
}

export async function deleteIntegrationsByRoom(
  roomId: string
): Promise<number> {
  const result = await query("DELETE FROM integrations WHERE room_id = $1", [
    roomId,
  ]);

  return result.rowCount ?? 0;
}
