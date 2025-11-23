import cron from "node-cron";
import { cleanupStalePresence } from "../repositories/presence";
import { query } from "./db";

/**
 * Initialize all cron jobs for database maintenance
 */
export function initCronJobs() {
  console.log("Initializing cron jobs...");

  // Cleanup stale presence records every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("Running presence cleanup...");
      const deleted = await cleanupStalePresence(5);
      console.log(`Cleaned up ${deleted} stale presence records`);
    } catch (error) {
      console.error("Failed to cleanup presence records:", error);
    }
  });

  // Cleanup inactive rooms every day at 3 AM
  cron.schedule("0 3 * * *", async () => {
    try {
      console.log("Running room cleanup...");
      const threshold = Date.now() - 8 * 24 * 60 * 60 * 1000; // 8 days

      const result = await query(
        "SELECT cleanup_inactive_rooms($1) as deleted_count",
        [8]
      );

      const deletedCount =
        (result.rows[0] as { deleted_count: number })?.deleted_count || 0;
      console.log(`Cleaned up ${deletedCount} inactive rooms`);
    } catch (error) {
      console.error("Failed to cleanup rooms:", error);
    }
  });

  // Cleanup old activities every week (Sunday at 2 AM)
  cron.schedule("0 2 * * 0", async () => {
    try {
      console.log("Running activities cleanup...");
      const threshold = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days

      const result = await query(
        "DELETE FROM activities WHERE created_at < $1",
        [threshold]
      );

      const deletedCount = result.rowCount || 0;
      console.log(`Cleaned up ${deletedCount} old activities`);
    } catch (error) {
      console.error("Failed to cleanup activities:", error);
    }
  });

  console.log("Cron jobs initialized successfully");
}

/**
 * Stop all cron jobs (for graceful shutdown)
 */
export function stopCronJobs() {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  console.log("All cron jobs stopped");
}
