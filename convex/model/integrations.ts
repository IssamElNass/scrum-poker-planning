/**
 * Generic integration model for managing platform connections
 * Supports GitHub, Jira, Trello, and future integrations
 */

import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { decrypt, encrypt, IntegrationCredentials } from "../lib/encryption";

export type IntegrationType = "github" | "jira" | "trello";

export interface IntegrationConfig {
  // GitHub
  repositoryUrl?: string;
  repositoryOwner?: string;
  repositoryName?: string;

  // Jira
  domain?: string;
  estimateFieldId?: string; // Custom field ID for story points

  // Trello
  boardId?: string;
}

export interface DecryptedIntegration {
  _id: Id<"integrations">;
  roomId: Id<"rooms">;
  type: IntegrationType;
  credentials: IntegrationCredentials;
  config: IntegrationConfig;
  connectedAt: number;
}

/**
 * Get the integration for a room (returns decrypted credentials)
 * Use this in actions only - never expose decrypted credentials in queries!
 */
export async function getIntegration(
  ctx: QueryCtx,
  roomId: Id<"rooms">
): Promise<DecryptedIntegration | null> {
  const integration = await ctx.db
    .query("integrations")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .first();

  if (!integration) {
    return null;
  }

  try {
    const credentials = await decrypt<IntegrationCredentials>(
      integration.encryptedCredentials
    );

    return {
      _id: integration._id,
      roomId: integration.roomId,
      type: integration.type,
      credentials,
      config: integration.config || {},
      connectedAt: integration.connectedAt,
    };
  } catch (error) {
    console.error("Failed to decrypt integration credentials:", error);
    throw new Error(
      "Failed to decrypt integration credentials. The encryption key may have changed."
    );
  }
}

/**
 * Get sanitized integration info (no credentials)
 * Safe to use in queries
 */
export async function getIntegrationInfo(
  ctx: QueryCtx,
  roomId: Id<"rooms">
): Promise<{
  type: IntegrationType;
  config: IntegrationConfig;
  connectedAt: number;
} | null> {
  const integration = await ctx.db
    .query("integrations")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .first();

  if (!integration) {
    return null;
  }

  return {
    type: integration.type,
    config: integration.config || {},
    connectedAt: integration.connectedAt,
  };
}

/**
 * Save or update an integration
 */
export async function saveIntegration(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  type: IntegrationType,
  credentials: IntegrationCredentials,
  config: IntegrationConfig
): Promise<Id<"integrations">> {
  // Encrypt credentials
  const encryptedCredentials = await encrypt(credentials);

  // Check if an integration already exists for this room
  const existing = await ctx.db
    .query("integrations")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .first();

  if (existing) {
    // Update existing integration
    await ctx.db.patch(existing._id, {
      type,
      encryptedCredentials,
      config,
      connectedAt: Date.now(),
    });
    return existing._id;
  } else {
    // Create new integration
    return await ctx.db.insert("integrations", {
      roomId,
      type,
      encryptedCredentials,
      config,
      connectedAt: Date.now(),
    });
  }
}

/**
 * Remove an integration
 */
export async function removeIntegration(
  ctx: MutationCtx,
  roomId: Id<"rooms">
): Promise<boolean> {
  const integration = await ctx.db
    .query("integrations")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .first();

  if (integration) {
    await ctx.db.delete(integration._id);
    return true;
  }

  return false;
}

/**
 * Check if a room has an integration of a specific type
 */
export async function hasIntegrationType(
  ctx: QueryCtx,
  roomId: Id<"rooms">,
  type: IntegrationType
): Promise<boolean> {
  const integration = await ctx.db
    .query("integrations")
    .withIndex("by_room", (q) => q.eq("roomId", roomId))
    .first();

  return integration?.type === type;
}
