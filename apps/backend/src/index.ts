import cors from "cors";
import { config } from "dotenv";
import express, { Request, Response } from "express";
import { initCronJobs, stopCronJobs } from "./lib/cron";
import { closePool } from "./lib/db";

// Import routes
import canvasRouter from "./routes/canvas";
import integrationsRouter from "./routes/integrations";
import roomsRouter from "./routes/rooms";
import timerRouter from "./routes/timer";
import usersRouter from "./routes/users";
import votesRouter from "./routes/votes";

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  config({ path: ".env" });
}

const app = express();
const port = parseInt(process.env.PORT || "4000", 10);

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "backend", timestamp: Date.now() });
});

// API routes
app.use("/api/rooms", roomsRouter);
app.use("/api/votes", votesRouter);
app.use("/api/users", usersRouter);
app.use("/api/canvas", canvasRouter);
app.use("/api/timer", timerRouter);
app.use("/api/integrations", integrationsRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);

  // Initialize cron jobs in production
  if (process.env.NODE_ENV === "production") {
    initCronJobs();
  }
});

// Graceful shutdown
const shutdown = async () => {
  console.log("\nShutting down backend gracefully...");

  // Stop cron jobs
  stopCronJobs();

  // Close database pool
  await closePool();
  console.log("Database connections closed");

  // Close HTTP server
  server.close(() => {
    console.log("Backend server closed");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default app;
