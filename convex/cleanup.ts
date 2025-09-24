import { internalMutation } from "./_generated/server";
import * as Cleanup from "./model/cleanup";

export const removeInactiveRooms = internalMutation({
  handler: async (ctx) => {
    // Use default 8 days for inactivity since teams usually one meeting to plan each week
    return await Cleanup.removeInactiveRooms(ctx, 8);
  },
});
