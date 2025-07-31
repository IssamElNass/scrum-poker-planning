import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import type { TimerNodeData } from "@/components/room/types";

export interface TimerState {
  currentSeconds: number;
  isRunning: boolean;
  displayTime: string;
}

export interface UpdateTimerStateArgs {
  roomId: Id<"rooms">;
  nodeId: string;
  action: "start" | "pause" | "reset";
  userId: Id<"users">;
}

/**
 * Calculates the current timer time based on server timestamps
 */
export function calculateCurrentTime(timerData: TimerNodeData): TimerState {
  const now = Date.now();
  let currentSeconds = timerData.elapsedSeconds;

  if (timerData.isRunning && timerData.startedAt) {
    // Add time since last start
    const runningSince = (now - timerData.startedAt) / 1000;
    currentSeconds += runningSince;
  }

  // Format time as MM:SS
  const minutes = Math.floor(currentSeconds / 60);
  const seconds = Math.floor(currentSeconds % 60);
  const displayTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return {
    currentSeconds: Math.floor(currentSeconds),
    isRunning: timerData.isRunning,
    displayTime,
  };
}

/**
 * Validates timer state transitions
 */
function validateTimerAction(
  currentData: TimerNodeData,
  action: "start" | "pause" | "reset"
): void {
  if (!currentData) {
    throw new Error("Timer node not found");
  }

  switch (action) {
    case "start":
      if (currentData.isRunning) {
        throw new Error("Timer is already running");
      }
      break;
    case "pause":
      if (!currentData.isRunning) {
        throw new Error("Timer is not running");
      }
      break;
    case "reset":
      // Reset is always allowed
      break;
    default:
      throw new Error(`Invalid timer action: ${action}`);
  }
}

/**
 * Updates timer state based on user action
 */
export async function updateTimerState(
  ctx: MutationCtx,
  args: UpdateTimerStateArgs
): Promise<void> {
  const now = Date.now();

  // Find the timer node
  const timerNode = await ctx.db
    .query("canvasNodes")
    .withIndex("by_room_node", (q) =>
      q.eq("roomId", args.roomId).eq("nodeId", args.nodeId)
    )
    .unique();

  if (!timerNode || timerNode.type !== "timer") {
    throw new Error("Timer node not found");
  }

  // Validate the action
  validateTimerAction(timerNode.data, args.action);

  // Calculate current elapsed time before updating
  const currentState = calculateCurrentTime(timerNode.data);
  
  let newData: TimerNodeData;

  switch (args.action) {
    case "start":
      newData = {
        ...timerNode.data,
        isRunning: true,
        startedAt: now,
        pausedAt: null,
        lastUpdatedBy: args.userId,
        lastAction: "start",
      };
      break;

    case "pause":
      newData = {
        ...timerNode.data,
        isRunning: false,
        startedAt: null,
        pausedAt: now,
        elapsedSeconds: currentState.currentSeconds,
        lastUpdatedBy: args.userId,
        lastAction: "pause",
      };
      break;

    case "reset":
      newData = {
        ...timerNode.data,
        isRunning: false,
        startedAt: null,
        pausedAt: null,
        elapsedSeconds: 0,
        lastUpdatedBy: args.userId,
        lastAction: "reset",
      };
      break;

    default:
      throw new Error(`Invalid timer action: ${args.action}`);
  }

  // Update the timer node
  await ctx.db.patch(timerNode._id, {
    data: newData,
    lastUpdatedBy: args.userId,
    lastUpdatedAt: now,
  });
}

/**
 * Gets the current timer state for a room
 */
export async function getTimerState(
  ctx: QueryCtx,
  args: { roomId: Id<"rooms">; nodeId: string }
): Promise<TimerState | null> {
  const timerNode = await ctx.db
    .query("canvasNodes")
    .withIndex("by_room_node", (q) =>
      q.eq("roomId", args.roomId).eq("nodeId", args.nodeId)
    )
    .unique();

  if (!timerNode || timerNode.type !== "timer") {
    return null;
  }

  return calculateCurrentTime(timerNode.data);
}

/**
 * Resets timer state (used when game resets)
 */
export async function resetTimerForGameReset(
  ctx: MutationCtx,
  args: { roomId: Id<"rooms"> }
): Promise<void> {
  const now = Date.now();

  // Find the timer node
  const timerNode = await ctx.db
    .query("canvasNodes")
    .withIndex("by_room_node", (q) =>
      q.eq("roomId", args.roomId).eq("nodeId", "timer")
    )
    .unique();

  if (!timerNode || timerNode.type !== "timer") {
    return; // No timer node found, nothing to reset
  }

  // Reset timer data
  const resetData = {
    ...timerNode.data,
    isRunning: false,
    startedAt: null,
    pausedAt: null,
    elapsedSeconds: 0,
    lastAction: "reset",
  };

  await ctx.db.patch(timerNode._id, {
    data: resetData,
    lastUpdatedAt: now,
  });
}