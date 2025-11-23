import { Router, Request, Response } from 'express';
import * as canvasRepo from '../repositories/canvas';
import * as roomsRepo from '../repositories/rooms';
import axios from 'axios';

const router = Router();

const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'http://localhost:5000';

// Helper to broadcast to WebSocket service
async function broadcastToWebSocket(event: string, data: any) {
  try {
    await axios.post(`${WEBSOCKET_URL}/broadcast`, { event, data });
  } catch (error) {
    console.error('Failed to broadcast to WebSocket:', error);
  }
}

interface TimerState {
  isRunning: boolean;
  timeRemaining: number;
  duration: number;
  startedAt?: number;
}

const TIMER_NODE_ID = 'timer-current';

async function getOrCreateTimerNode(roomId: string): Promise<canvasRepo.CanvasNode> {
  let node = await canvasRepo.getCanvasNode(roomId, TIMER_NODE_ID);

  if (!node) {
    // Create default timer node
    node = await canvasRepo.createCanvasNode({
      roomId,
      nodeId: TIMER_NODE_ID,
      type: 'timer',
      position: { x: 100, y: 100 },
      data: {
        isRunning: false,
        timeRemaining: 300000, // 5 minutes default
        duration: 300000,
      },
    });
  }

  return node;
}

// Start timer
router.post('/:roomId/start', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { duration } = req.body;
    
    const now = Date.now();
    await getOrCreateTimerNode(roomId);

    const timerState: TimerState = {
      isRunning: true,
      timeRemaining: duration,
      duration,
      startedAt: now,
    };

    await canvasRepo.updateCanvasNode(roomId, TIMER_NODE_ID, {
      data: timerState,
    });

    // Update room activity
    await roomsRepo.updateRoomActivity(roomId);

    // Broadcast to WebSocket service
    await broadcastToWebSocket('timer-update', { roomId, timerState });

    res.json({ success: true, data: timerState });
  } catch (error) {
    console.error('Failed to start timer:', error);
    res.status(500).json({ success: false, error: 'Failed to start timer' });
  }
});

// Pause timer
router.post('/:roomId/pause', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    
    const node = await getOrCreateTimerNode(roomId);
    const currentData = node.data as TimerState;

    // Calculate remaining time
    let timeRemaining = currentData.timeRemaining;
    if (currentData.isRunning && currentData.startedAt) {
      const elapsed = Date.now() - currentData.startedAt;
      timeRemaining = Math.max(0, currentData.timeRemaining - elapsed);
    }

    const timerState: TimerState = {
      isRunning: false,
      timeRemaining,
      duration: currentData.duration,
    };

    await canvasRepo.updateCanvasNode(roomId, TIMER_NODE_ID, {
      data: timerState,
    });

    // Broadcast to WebSocket service
    await broadcastToWebSocket('timer-update', { roomId, timerState });

    res.json({ success: true, data: timerState });
  } catch (error) {
    console.error('Failed to pause timer:', error);
    res.status(500).json({ success: false, error: 'Failed to pause timer' });
  }
});

// Resume timer
router.post('/:roomId/resume', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    
    const node = await getOrCreateTimerNode(roomId);
    const currentData = node.data as TimerState;
    const now = Date.now();

    const timerState: TimerState = {
      isRunning: true,
      timeRemaining: currentData.timeRemaining,
      duration: currentData.duration,
      startedAt: now,
    };

    await canvasRepo.updateCanvasNode(roomId, TIMER_NODE_ID, {
      data: timerState,
    });

    // Broadcast to WebSocket service
    await broadcastToWebSocket('timer-update', { roomId, timerState });

    res.json({ success: true, data: timerState });
  } catch (error) {
    console.error('Failed to resume timer:', error);
    res.status(500).json({ success: false, error: 'Failed to resume timer' });
  }
});

// Reset timer
router.post('/:roomId/reset', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { duration } = req.body;
    
    const node = await getOrCreateTimerNode(roomId);
    const currentData = node.data as TimerState;
    const newDuration = duration ?? currentData.duration ?? 300000;

    const timerState: TimerState = {
      isRunning: false,
      timeRemaining: newDuration,
      duration: newDuration,
    };

    await canvasRepo.updateCanvasNode(roomId, TIMER_NODE_ID, {
      data: timerState,
    });

    // Broadcast to WebSocket service
    await broadcastToWebSocket('timer-update', { roomId, timerState });

    res.json({ success: true, data: timerState });
  } catch (error) {
    console.error('Failed to reset timer:', error);
    res.status(500).json({ success: false, error: 'Failed to reset timer' });
  }
});

// Get timer state
router.get('/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    
    const node = await getOrCreateTimerNode(roomId);
    const timerState = node.data as TimerState;

    res.json({ success: true, data: timerState });
  } catch (error) {
    console.error('Failed to get timer state:', error);
    res.status(500).json({ success: false, error: 'Failed to get timer state' });
  }
});

export default router;

