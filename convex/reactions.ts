import { v } from "convex/values";
import { mutation } from "./_generated/server";

const COOLDOWN_MS = 2500; // 2.5 seconds cooldown

// Ephemeral reaction broadcast - updates user record to trigger real-time sync
export const broadcastReaction = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    emojiType: v.union(
      v.literal("thumbsUp"),
      v.literal("heart"),
      v.literal("clap"),
      v.literal("fire"),
      v.literal("thinking"),
      v.literal("party")
    ),
  },
  handler: async (ctx, args) => {
    const { roomId, userId, emojiType } = args;

    // Verify user exists and is in the room
    const user = await ctx.db.get(userId);
    if (!user || user.roomId !== roomId) {
      throw new Error("User not found or not in room");
    }

    const now = Date.now();

    // Check cooldown
    if (user.lastReactionAt) {
      const timeSinceLastReaction = now - user.lastReactionAt;
      if (timeSinceLastReaction < COOLDOWN_MS) {
        throw new Error(
          `Please wait ${Math.ceil((COOLDOWN_MS - timeSinceLastReaction) / 1000)} more seconds`
        );
      }
    }

    // Update user with new reaction - this broadcasts to all clients via real-time subscription
    await ctx.db.patch(userId, {
      lastReactionType: emojiType,
      lastReactionAt: now,
    });

    // Return the reaction details for immediate local update
    return {
      userId,
      userName: user.name,
      emojiType,
      timestamp: now,
    };
  },
});
