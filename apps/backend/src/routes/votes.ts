import { Router, Request, Response } from 'express';
import * as votesRepo from '../repositories/votes';
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

// Cast vote
router.post('/', async (req: Request, res: Response) => {
  try {
    const { roomId, userId, cardLabel, cardValue, cardIcon } = req.body;
    
    const vote = await votesRepo.castVote({
      roomId,
      userId,
      cardLabel,
      cardValue,
      cardIcon,
    });
    
    // Update room activity
    await roomsRepo.updateRoomActivity(roomId);
    
    // Get all votes for the room
    const allVotes = await votesRepo.getVotesByRoom(roomId);
    
    // Broadcast to WebSocket service
    await broadcastToWebSocket('vote-cast', {
      roomId,
      userId,
      cardLabel,
      cardValue,
      votes: allVotes,
    });
    
    res.json({ success: true, data: vote });
  } catch (error) {
    console.error('Failed to cast vote:', error);
    res.status(500).json({ success: false, error: 'Failed to cast vote' });
  }
});

// Clear votes
router.delete('/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    
    await votesRepo.clearVotesByRoom(roomId);
    
    // Update room activity
    await roomsRepo.updateRoomActivity(roomId);
    
    // Broadcast to WebSocket service
    await broadcastToWebSocket('vote-reset', { roomId });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear votes:', error);
    res.status(500).json({ success: false, error: 'Failed to clear votes' });
  }
});

// Reveal votes
router.post('/:roomId/reveal', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { revealed } = req.body;
    
    // Update game state
    await roomsRepo.updateRoom(roomId, { isGameOver: revealed });
    
    // Broadcast to WebSocket service
    await broadcastToWebSocket('vote-revealed', { roomId, revealed });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to reveal votes:', error);
    res.status(500).json({ success: false, error: 'Failed to reveal votes' });
  }
});

// Remove specific vote
router.delete('/:roomId/user/:userId', async (req: Request, res: Response) => {
  try {
    const { roomId, userId } = req.params;
    
    await votesRepo.deleteVote(roomId, userId);
    
    // Get all votes for the room
    const allVotes = await votesRepo.getVotesByRoom(roomId);
    
    // Broadcast to WebSocket service
    await broadcastToWebSocket('vote-cast', {
      roomId,
      votes: allVotes,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to remove vote:', error);
    res.status(500).json({ success: false, error: 'Failed to remove vote' });
  }
});

// Get votes for a room
router.get('/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const votes = await votesRepo.getVotesByRoom(roomId);
    
    res.json({ success: true, data: votes });
  } catch (error) {
    console.error('Failed to get votes:', error);
    res.status(500).json({ success: false, error: 'Failed to get votes' });
  }
});

export default router;

