import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Set the active story for a room
export const setActiveStory = mutation({
  args: {
    roomId: v.id("rooms"),
    nodeId: v.optional(v.string()), // If null, deactivates all stories
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // If nodeId is provided, verify it exists and is a story
    if (args.nodeId) {
      const nodeId = args.nodeId; // Capture in const to help TypeScript
      const storyNode = await ctx.db
        .query("canvasNodes")
        .withIndex("by_room_node", (q) =>
          q.eq("roomId", args.roomId).eq("nodeId", nodeId)
        )
        .unique();

      if (!storyNode || storyNode.type !== "story") {
        throw new Error("Story node not found");
      }
    }

    // Reset game state when switching stories
    await ctx.db.patch(args.roomId, {
      activeStoryNodeId: args.nodeId || undefined,
      isGameOver: false,
    });

    // Clear all votes
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    await Promise.all(votes.map((vote) => ctx.db.delete(vote._id)));

    return { success: true };
  },
});

// Submit estimation for current story and move to next
export const submitEstimation = mutation({
  args: {
    roomId: v.id("rooms"),
    estimate: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || !room.activeStoryNodeId) {
      throw new Error("No active story");
    }

    const activeNodeId = room.activeStoryNodeId;

    // Get the current story node
    const currentStory = await ctx.db
      .query("canvasNodes")
      .withIndex("by_room_node", (q) =>
        q.eq("roomId", args.roomId).eq("nodeId", activeNodeId)
      )
      .unique();

    if (!currentStory) {
      throw new Error("Active story not found");
    }

    // Mark story as completed with the estimate
    await ctx.db.patch(currentStory._id, {
      data: {
        ...currentStory.data,
        finalEstimate: args.estimate,
        completedAt: Date.now(),
      },
    });

    // Note: Automatic export is handled by the integration systems themselves
    // GitHub and Jira exports can be triggered manually from the UI
    // The export logic is intentionally not automated here to give users control

    // Find next story
    const allStories = await ctx.db
      .query("canvasNodes")
      .withIndex("by_room_type", (q) =>
        q.eq("roomId", args.roomId).eq("type", "story")
      )
      .collect();

    const incompleteStories = allStories.filter(
      (s) => !s.data.completedAt && s.nodeId !== room.activeStoryNodeId
    );

    // Move to next story or deactivate if none left
    const nextStory = incompleteStories[0];
    await ctx.db.patch(args.roomId, {
      activeStoryNodeId: nextStory?.nodeId || undefined,
      isGameOver: false,
    });

    // Clear votes
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    await Promise.all(votes.map((vote) => ctx.db.delete(vote._id)));

    return { success: true, hasNextStory: !!nextStory };
  },
});

// Skip current story and move to next
export const skipStory = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || !room.activeStoryNodeId) {
      throw new Error("No active story");
    }

    const activeNodeId = room.activeStoryNodeId;

    // Get the current story node
    const currentStory = await ctx.db
      .query("canvasNodes")
      .withIndex("by_room_node", (q) =>
        q.eq("roomId", args.roomId).eq("nodeId", activeNodeId)
      )
      .unique();

    if (!currentStory) {
      throw new Error("Active story not found");
    }

    // Mark story as skipped
    await ctx.db.patch(currentStory._id, {
      data: {
        ...currentStory.data,
        skipped: true,
        skippedAt: Date.now(),
      },
    });

    // Find next story
    const allStories = await ctx.db
      .query("canvasNodes")
      .withIndex("by_room_type", (q) =>
        q.eq("roomId", args.roomId).eq("type", "story")
      )
      .collect();

    const incompleteStories = allStories.filter(
      (s) =>
        !s.data.completedAt &&
        !s.data.skipped &&
        s.nodeId !== room.activeStoryNodeId
    );

    // Move to next story or deactivate if none left
    const nextStory = incompleteStories[0];
    await ctx.db.patch(args.roomId, {
      activeStoryNodeId: nextStory?.nodeId || undefined,
      isGameOver: false,
    });

    // Clear votes
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    await Promise.all(votes.map((vote) => ctx.db.delete(vote._id)));

    return { success: true, hasNextStory: !!nextStory };
  },
});

// Get active story for a room
export const getActiveStory = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || !room.activeStoryNodeId) {
      return null;
    }

    const activeNodeId = room.activeStoryNodeId;

    const storyNode = await ctx.db
      .query("canvasNodes")
      .withIndex("by_room_node", (q) =>
        q.eq("roomId", args.roomId).eq("nodeId", activeNodeId)
      )
      .unique();

    return storyNode;
  },
});
