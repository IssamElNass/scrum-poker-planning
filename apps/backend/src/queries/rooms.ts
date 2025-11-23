import * as activitiesRepo from "../repositories/activities";
import * as canvasRepo from "../repositories/canvas";
import * as integrationsRepo from "../repositories/integrations";
import * as roomsRepo from "../repositories/rooms";
import * as usersRepo from "../repositories/users";
import * as votesRepo from "../repositories/votes";

export interface RoomData {
  room: roomsRepo.Room;
  users: usersRepo.User[];
  votes: votesRepo.Vote[];
  voteCount: number;
  userCount: number;
}

export interface CanvasData {
  nodes: canvasRepo.CanvasNode[];
}

/**
 * Get complete room data for Server Components
 */
export async function getRoomData(roomId: string): Promise<RoomData | null> {
  try {
    const [room, users, votes] = await Promise.all([
      roomsRepo.getRoomById(roomId),
      usersRepo.getUsersByRoom(roomId),
      votesRepo.getVotesByRoom(roomId),
    ]);

    if (!room) {
      return null;
    }

    return {
      room,
      users,
      votes,
      voteCount: votes.length,
      userCount: users.length,
    };
  } catch (error) {
    console.error("Failed to get room data:", error);
    return null;
  }
}

/**
 * Get canvas nodes for a room
 */
export async function getCanvasNodes(roomId: string): Promise<CanvasData> {
  try {
    const nodes = await canvasRepo.getCanvasNodesByRoom(roomId);
    return { nodes };
  } catch (error) {
    console.error("Failed to get canvas nodes:", error);
    return { nodes: [] };
  }
}

/**
 * Get activity feed for a room
 */
export async function getActivities(roomId: string, limit: number = 50) {
  try {
    return await activitiesRepo.getActivitiesByRoom(roomId, limit);
  } catch (error) {
    console.error("Failed to get activities:", error);
    return [];
  }
}

/**
 * Get user presence for a room
 */
export async function getUserPresence(roomId: string) {
  try {
    const { getPresenceByRoom } = await import("../repositories/presence");
    return await getPresenceByRoom(roomId);
  } catch (error) {
    console.error("Failed to get user presence:", error);
    return [];
  }
}

/**
 * Get integrations for a room
 */
export async function getIntegrations(roomId: string) {
  try {
    return await integrationsRepo.getIntegrationsByRoom(roomId);
  } catch (error) {
    console.error("Failed to get integrations:", error);
    return [];
  }
}

/**
 * Get canvas state for a user
 */
export async function getCanvasState(roomId: string, userId: string) {
  try {
    return await canvasRepo.getCanvasState(roomId, userId);
  } catch (error) {
    console.error("Failed to get canvas state:", error);
    return null;
  }
}

/**
 * Check if room exists
 */
export async function roomExists(roomId: string): Promise<boolean> {
  try {
    const room = await roomsRepo.getRoomById(roomId);
    return room !== null;
  } catch (error) {
    console.error("Failed to check room existence:", error);
    return false;
  }
}
