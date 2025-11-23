import { Router, Request, Response } from 'express';
import * as usersRepo from '../repositories/users';
import * as activitiesRepo from '../repositories/activities';
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

// Join room (create user)
router.post('/join', async (req: Request, res: Response) => {
  try {
    const { roomId, name, isSpectator = false } = req.body;
    
    // Verify room exists
    const room = await roomsRepo.getRoomById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    
    // Create user
    const user = await usersRepo.createUser({
      roomId,
      name,
      isSpectator,
    });
    
    // Update room activity
    await roomsRepo.updateRoomActivity(roomId);
    
    // Broadcast to WebSocket service
    await broadcastToWebSocket('user-connected', {
      roomId,
      user: {
        id: user.id,
        name: user.name,
        isSpectator: user.isSpectator,
      },
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Failed to join room:', error);
    res.status(500).json({ success: false, error: 'Failed to join room' });
  }
});

// Leave room (delete user)
router.post('/leave', async (req: Request, res: Response) => {
  try {
    const { roomId, userId } = req.body;
    
    // Get user name before deletion
    const user = await usersRepo.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Delete user
    const deleted = await usersRepo.deleteUser(userId);
    
    if (!deleted) {
      return res.status(500).json({ success: false, error: 'Failed to remove user' });
    }
    
    // Create activity
    await activitiesRepo.createActivity({
      roomId,
      type: 'user_left',
      userName: user.name,
    });
    
    // Broadcast to WebSocket service
    await broadcastToWebSocket('user-disconnected', {
      roomId,
      userId,
      userName: user.name,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to leave room:', error);
    res.status(500).json({ success: false, error: 'Failed to leave room' });
  }
});

// Kick user
router.post('/:userId/kick', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { roomId } = req.body;
    
    // Get user name before deletion
    const user = await usersRepo.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Delete user
    const deleted = await usersRepo.deleteUser(userId);
    
    if (!deleted) {
      return res.status(500).json({ success: false, error: 'Failed to kick user' });
    }
    
    // Create activity
    await activitiesRepo.createActivity({
      roomId,
      type: 'user_kicked',
      userName: user.name,
    });
    
    // Broadcast to WebSocket service
    await broadcastToWebSocket('user-kicked', {
      roomId,
      userId,
      userName: user.name,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to kick user:', error);
    res.status(500).json({ success: false, error: 'Failed to kick user' });
  }
});

// Update user role
router.patch('/:userId/role', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isSpectator } = req.body;
    
    const user = await usersRepo.updateUser(userId, { isSpectator });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Broadcast to WebSocket service
    await broadcastToWebSocket('user-updated', {
      roomId: user.roomId,
      user: {
        id: user.id,
        name: user.name,
        isSpectator: user.isSpectator,
      },
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Failed to update user role:', error);
    res.status(500).json({ success: false, error: 'Failed to update user role' });
  }
});

// Update user name
router.patch('/:userId/name', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;
    
    const user = await usersRepo.updateUser(userId, { name });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Broadcast to WebSocket service
    await broadcastToWebSocket('user-updated', {
      roomId: user.roomId,
      user: {
        id: user.id,
        name: user.name,
        isSpectator: user.isSpectator,
      },
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Failed to update user name:', error);
    res.status(500).json({ success: false, error: 'Failed to update user name' });
  }
});

// Send reaction
router.post('/:userId/reaction', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { roomId, reactionType } = req.body;
    
    const now = Date.now();
    
    // Update user's last reaction
    const user = await usersRepo.updateUser(userId, {
      lastReactionType: reactionType,
      lastReactionAt: now,
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Broadcast to WebSocket service
    await broadcastToWebSocket('emoji-reaction', {
      roomId,
      userId,
      userName: user.name,
      reactionType,
      timestamp: now,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to send reaction:', error);
    res.status(500).json({ success: false, error: 'Failed to send reaction' });
  }
});

// Get users in a room
router.get('/room/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const users = await usersRepo.getUsersByRoom(roomId);
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Failed to get users:', error);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

export default router;

