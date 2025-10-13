import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily at 3 AM UTC
crons.daily(
  "cleanup-inactive-rooms",
  { hourUTC: 3, minuteUTC: 0 },
  internal.cleanup.removeInactiveRooms
);

export default crons;
