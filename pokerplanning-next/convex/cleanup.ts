import { internalMutation } from "./_generated/server";

export const removeInactiveRooms = internalMutation({
  handler: async (ctx) => {
    const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
    
    // Find inactive rooms
    const inactiveRooms = await ctx.db
      .query("rooms")
      .withIndex("by_activity", (q) => q.lt("lastActivityAt", fiveDaysAgo))
      .collect();
    
    console.log(`Found ${inactiveRooms.length} inactive rooms to clean up`);
    
    for (const room of inactiveRooms) {
      // Delete all votes for this room
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .collect();
      
      for (const vote of votes) {
        await ctx.db.delete(vote._id);
      }
      
      // Delete all users in this room
      const users = await ctx.db
        .query("users")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .collect();
      
      for (const user of users) {
        await ctx.db.delete(user._id);
      }
      
      // Delete the room
      await ctx.db.delete(room._id);
      
      console.log(`Cleaned up room ${room.name} (${room._id})`);
    }
    
    return { roomsDeleted: inactiveRooms.length };
  },
});