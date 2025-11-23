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

// Get all canvas nodes for a room
router.get('/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const nodes = await canvasRepo.getCanvasNodesByRoom(roomId);
    
    res.json({ success: true, data: nodes });
  } catch (error) {
    console.error('Failed to get canvas nodes:', error);
    res.status(500).json({ success: false, error: 'Failed to get canvas nodes' });
  }
});

// Create or update canvas node
router.post('/:roomId/nodes', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { nodeId, type, position, data, lastUpdatedBy } = req.body;
    
    const node = await canvasRepo.createCanvasNode({
      roomId,
      nodeId,
      type,
      position,
      data,
      lastUpdatedBy,
    });
    
    // Update room activity
    await roomsRepo.updateRoomActivity(roomId);
    
    // Broadcast to WebSocket service
    await broadcastToWebSocket('canvas-update', {
      roomId,
      node: {
        nodeId: node.nodeId,
        type: node.type,
        position: node.position,
        data: node.data,
      },
    });
    
    res.json({ success: true, data: node });
  } catch (error) {
    console.error('Failed to create canvas node:', error);
    res.status(500).json({ success: false, error: 'Failed to create canvas node' });
  }
});

// Update canvas node
router.patch('/:roomId/nodes/:nodeId', async (req: Request, res: Response) => {
  try {
    const { roomId, nodeId } = req.params;
    const { position, data, isLocked, lastUpdatedBy } = req.body;
    
    const node = await canvasRepo.updateCanvasNode(roomId, nodeId, {
      position,
      data,
      isLocked,
      lastUpdatedBy,
    });
    
    if (!node) {
      return res.status(404).json({ success: false, error: 'Node not found' });
    }
    
    // Update room activity
    await roomsRepo.updateRoomActivity(roomId);
    
    // Broadcast to WebSocket service
    await broadcastToWebSocket('canvas-update', {
      roomId,
      node: {
        nodeId: node.nodeId,
        type: node.type,
        position: node.position,
        data: node.data,
      },
    });
    
    res.json({ success: true, data: node });
  } catch (error) {
    console.error('Failed to update canvas node:', error);
    res.status(500).json({ success: false, error: 'Failed to update canvas node' });
  }
});

// Delete canvas node
router.delete('/:roomId/nodes/:nodeId', async (req: Request, res: Response) => {
  try {
    const { roomId, nodeId } = req.params;
    
    const deleted = await canvasRepo.deleteCanvasNode(roomId, nodeId);
    
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Node not found' });
    }
    
    // Broadcast to WebSocket service
    await broadcastToWebSocket('canvas-node-deleted', { roomId, nodeId });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete canvas node:', error);
    res.status(500).json({ success: false, error: 'Failed to delete canvas node' });
  }
});

// Save canvas state (viewport)
router.post('/:roomId/state', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { userId, viewport } = req.body;
    
    const state = await canvasRepo.saveCanvasState(roomId, userId, viewport);
    
    res.json({ success: true, data: state });
  } catch (error) {
    console.error('Failed to save canvas state:', error);
    res.status(500).json({ success: false, error: 'Failed to save canvas state' });
  }
});

export default router;

