import axios from "axios";
import cors from "cors";
import { config } from "dotenv";
import express, { Request, Response } from "express";
import { createServer } from "http";
import { Socket, Server as SocketIOServer } from "socket.io";

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  config({ path: ".env" });
}

const app = express();
const server = createServer(app);
const port = parseInt(process.env.PORT || "5000", 10);
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());

// Initialize Socket.io with optimistic updates enabled
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  path: "/socket.io",
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "websocket", timestamp: Date.now() });
});

// Broadcast endpoint for Backend to trigger WebSocket events
app.post("/broadcast", (req: Request, res: Response) => {
  const { event, data } = req.body;

  if (!event || !data) {
    return res.status(400).json({ error: "Missing event or data" });
  }

  // Broadcast to specific room if roomId is provided
  if (data.roomId) {
    io.to(data.roomId).emit(event, data);
  } else {
    io.emit(event, data);
  }

  res.json({ success: true });
});

// Helper function to persist data to backend (async, non-blocking)
async function persistToBackend(endpoint: string, data: any): Promise<boolean> {
  try {
    await axios.post(`${BACKEND_URL}${endpoint}`, data);
    return true;
  } catch (error) {
    console.error("Failed to persist to backend:", error);
    return false;
  }
}

// Socket.io connection handler with OPTIMISTIC REAL-TIME UPDATES
io.on("connection", (socket: Socket) => {
  console.log("Client connected:", socket.id);

  // Join a room
  socket.on(
    "join-room",
    async (data: { roomId: string; userId: string; userName: string }) => {
      const { roomId, userId, userName } = data;

      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);

      // INSTANT BROADCAST - no waiting for DB
      socket.to(roomId).emit("user-connected", { userId, userName });

      // Async persist to backend (non-blocking)
      persistToBackend("/api/users/join", {
        roomId,
        name: userName,
        isSpectator: false,
      });
    }
  );

  // Leave a room
  socket.on("leave-room", async (data: { roomId: string; userId: string }) => {
    const { roomId, userId } = data;

    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);

    // INSTANT BROADCAST
    socket.to(roomId).emit("user-disconnected", { userId });

    // Async persist to backend
    persistToBackend("/api/users/leave", { roomId, userId });
  });

  // VOTING - INSTANT BROADCAST (Critical for real-time feel)
  socket.on(
    "vote-cast",
    async (data: {
      roomId: string;
      userId: string;
      cardLabel: string;
      cardValue: number;
    }) => {
      const { roomId, userId, cardLabel, cardValue } = data;

      // INSTANT BROADCAST to all users in room
      io.to(roomId).emit("vote-cast", { userId, cardLabel, cardValue });

      // Async persist to backend
      const success = await persistToBackend("/api/votes", {
        roomId,
        userId,
        cardLabel,
        cardValue,
      });

      // If persistence failed, send correction
      if (!success) {
        io.to(roomId).emit("vote-error", {
          userId,
          error: "Failed to save vote",
        });
      }
    }
  );

  // Vote revealed
  socket.on(
    "vote-revealed",
    async (data: { roomId: string; revealed: boolean }) => {
      const { roomId, revealed } = data;

      // INSTANT BROADCAST
      io.to(roomId).emit("vote-revealed", { revealed });

      // Async persist
      persistToBackend(`/api/votes/${roomId}/reveal`, { revealed });
    }
  );

  // Vote reset
  socket.on("vote-reset", async (data: { roomId: string }) => {
    const { roomId } = data;

    // INSTANT BROADCAST
    io.to(roomId).emit("vote-reset", {});

    // Async persist
    persistToBackend(`/api/votes/${roomId}`, {});
  });

  // ROOM SETTINGS - INSTANT UPDATES
  socket.on(
    "room-settings-updated",
    async (data: { roomId: string; settings: any }) => {
      const { roomId, settings } = data;

      // INSTANT BROADCAST
      io.to(roomId).emit("room-settings-updated", { settings });

      // Async persist
      persistToBackend(`/api/rooms/${roomId}/settings`, settings);
    }
  );

  // Active story changed
  socket.on(
    "active-story-changed",
    async (data: { roomId: string; storyNodeId: string | null }) => {
      const { roomId, storyNodeId } = data;

      // INSTANT BROADCAST
      io.to(roomId).emit("active-story-changed", { storyNodeId });

      // Async persist
      persistToBackend(`/api/rooms/${roomId}/active-story`, { storyNodeId });
    }
  );

  // Game state updated
  socket.on(
    "game-state-updated",
    async (data: { roomId: string; isGameOver: boolean }) => {
      const { roomId, isGameOver } = data;

      // INSTANT BROADCAST
      io.to(roomId).emit("game-state-updated", { isGameOver });

      // Async persist
      persistToBackend(`/api/rooms/${roomId}/game-state`, { isGameOver });
    }
  );

  // EMOJI REACTIONS - INSTANT
  socket.on(
    "emoji-reaction",
    async (data: {
      roomId: string;
      userId: string;
      emoji: string;
      x: number;
      y: number;
    }) => {
      const { roomId, userId, emoji, x, y } = data;

      // INSTANT BROADCAST
      socket.to(roomId).emit("emoji-reaction", { userId, emoji, x, y });

      // Async persist
      persistToBackend(`/api/users/${userId}/reaction`, {
        roomId,
        reactionType: emoji,
      });
    }
  );

  // TIMER UPDATES - INSTANT
  socket.on(
    "timer-update",
    async (data: { roomId: string; timerState: any }) => {
      const { roomId, timerState } = data;

      // INSTANT BROADCAST
      io.to(roomId).emit("timer-update", { timerState });
    }
  );

  // CANVAS UPDATES - INSTANT
  socket.on(
    "canvas-update",
    async (data: {
      roomId: string;
      nodeId: string;
      position?: { x: number; y: number };
      data?: any;
    }) => {
      const { roomId, nodeId, position, data: nodeData } = data;

      // INSTANT BROADCAST
      socket
        .to(roomId)
        .emit("canvas-update", { nodeId, position, data: nodeData });

      // Async persist
      if (nodeId && (position || nodeData)) {
        persistToBackend(`/api/canvas/${roomId}/nodes/${nodeId}`, {
          position,
          data: nodeData,
        });
      }
    }
  );

  // PRESENCE UPDATES (cursor position) - INSTANT, NO PERSIST
  socket.on(
    "presence-update",
    (data: {
      roomId: string;
      userId: string;
      cursor?: { x: number; y: number };
    }) => {
      // INSTANT BROADCAST - No persistence needed for cursor
      socket.to(data.roomId).emit("presence-update", {
        userId: data.userId,
        cursor: data.cursor,
      });
    }
  );

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`WebSocket server running on http://localhost:${port}`);
  console.log(`Socket.io ready on ws://localhost:${port}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log("\nShutting down WebSocket service gracefully...");

  // Close Socket.io connections
  io.close(() => {
    console.log("Socket.io closed");
  });

  // Close HTTP server
  server.close(() => {
    console.log("WebSocket server closed");
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

export default io;
