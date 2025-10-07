import { v } from "convex/values";
import { query } from "./_generated/server";

// Get recent activities for a room
export const getRecent = query({
  args: {
    roomId: v.id("rooms"),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("activities")
      .withIndex("by_room_created", (q) => q.eq("roomId", args.roomId));

    let activities = await query.collect();

    // Filter by timestamp if provided
    if (args.since !== undefined) {
      activities = activities.filter((a) => a.createdAt > args.since);
    }

    // Return most recent activities first
    return activities.sort((a, b) => b.createdAt - a.createdAt);
  },
});
