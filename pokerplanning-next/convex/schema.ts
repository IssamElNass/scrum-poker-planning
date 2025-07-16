import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    name: v.string(),
    votingCategorized: v.boolean(),
    autoCompleteVoting: v.boolean(),
    roomType: v.union(v.literal("classic"), v.literal("canvas")),
    isGameOver: v.boolean(),
    createdAt: v.number(),
    lastActivityAt: v.number(),
  }).index("by_activity", ["lastActivityAt"]),
  
  users: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    isSpectator: v.boolean(),
    joinedAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_join", ["roomId", "joinedAt"]),
  
  votes: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    cardLabel: v.optional(v.string()),
    cardValue: v.optional(v.number()),
    cardIcon: v.optional(v.string()),
  })
    .index("by_room", ["roomId"])
    .index("by_room_user", ["roomId", "userId"]),
});