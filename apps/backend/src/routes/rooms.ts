import axios from "axios";
import bcrypt from "bcryptjs";
import { Request, Response, Router } from "express";
import { getRoomData } from "../queries/rooms";
import * as roomsRepo from "../repositories/rooms";

const router = Router();

const WEBSOCKET_URL = process.env.WEBSOCKET_URL || "http://localhost:5000";

// Helper to broadcast to WebSocket service
async function broadcastToWebSocket(event: string, data: any) {
  try {
    await axios.post(`${WEBSOCKET_URL}/broadcast`, { event, data });
  } catch (error) {
    console.error("Failed to broadcast to WebSocket:", error);
  }
}

// Get room data with users and votes
router.get("/:roomId", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const roomData = await getRoomData(roomId);

    if (!roomData) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    res.json({ success: true, data: roomData });
  } catch (error) {
    console.error("Failed to fetch room data:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch room data" });
  }
});

// Create room
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      name,
      votingCategorized,
      autoCompleteVoting,
      roomType,
      votingSystem,
      password,
    } = req.body;

    // Hash password if provided
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const room = await roomsRepo.createRoom({
      name,
      votingCategorized,
      autoCompleteVoting,
      roomType,
      votingSystem,
      password: hashedPassword,
    });

    res.json({ success: true, data: room });
  } catch (error) {
    console.error("Failed to create room:", error);
    res.status(500).json({ success: false, error: "Failed to create room" });
  }
});

// Update room settings
router.patch("/:roomId/settings", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const {
      name,
      votingCategorized,
      autoCompleteVoting,
      votingSystem,
      password,
    } = req.body;

    // Hash password if provided
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const room = await roomsRepo.updateRoom(roomId, {
      name,
      votingCategorized,
      autoCompleteVoting,
      votingSystem,
      password: hashedPassword,
    });

    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    // Broadcast to WebSocket service
    await broadcastToWebSocket("room-settings-updated", {
      roomId,
      settings: {
        name: room.name,
        votingCategorized: room.votingCategorized,
        autoCompleteVoting: room.autoCompleteVoting,
        votingSystem: room.votingSystem,
      },
    });

    res.json({ success: true, data: room });
  } catch (error) {
    console.error("Failed to update room settings:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update room settings" });
  }
});

// Update game state
router.patch("/:roomId/game-state", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { isGameOver } = req.body;

    const room = await roomsRepo.updateRoom(roomId, { isGameOver });

    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    // Broadcast to WebSocket service
    await broadcastToWebSocket("game-state-updated", { roomId, isGameOver });

    res.json({ success: true, data: room });
  } catch (error) {
    console.error("Failed to update game state:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update game state" });
  }
});

// Set active story
router.patch("/:roomId/active-story", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { storyNodeId } = req.body;

    const room = await roomsRepo.updateRoom(roomId, {
      activeStoryNodeId: storyNodeId || undefined,
    });

    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    // Broadcast to WebSocket service
    await broadcastToWebSocket("active-story-changed", {
      roomId,
      storyNodeId: room.activeStoryNodeId,
    });

    res.json({ success: true, data: room });
  } catch (error) {
    console.error("Failed to set active story:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to set active story" });
  }
});

// Delete room
router.delete("/:roomId", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const deleted = await roomsRepo.deleteRoom(roomId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete room:", error);
    res.status(500).json({ success: false, error: "Failed to delete room" });
  }
});

// Verify room password
router.post("/:roomId/verify-password", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { password } = req.body;

    const room = await roomsRepo.getRoomById(roomId);

    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    if (!room.password) {
      return res.json({ success: true }); // No password required
    }

    const isValid = await bcrypt.compare(password, room.password);

    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid password" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to verify password:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to verify password" });
  }
});

export default router;
