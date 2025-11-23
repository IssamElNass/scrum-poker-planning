/**
 * Central type definitions for the Poker Planning application
 * These replace the Convex generated types
 */

// Base ID type - rooms and users use string IDs
export type Id<T extends string> = string;

// Room related types
export interface Room {
  id: string;
  name: string;
  votingCategorized: boolean;
  autoCompleteVoting: boolean;
  roomType: string;
  votingSystem: VotingSystem;
  isGameOver: boolean;
  createdAt: number;
  lastActivityAt: number;
  ownerId?: string;
  password?: string;
  activeStoryNodeId?: string;
}

export type VotingSystem = 'fibonacci' | 'modified-fibonacci' | 'tshirt' | 'powers-of-2';

// User related types
export interface User {
  id: string;
  roomId: string;
  name: string;
  isSpectator: boolean;
  joinedAt: number;
  lastReactionType?: ReactionType;
  lastReactionAt?: number;
}

export type ReactionType = 'thumbsUp' | 'heart' | 'clap' | 'fire' | 'thinking' | 'party';

// Vote related types
export interface Vote {
  id: string;
  roomId: string;
  userId: string;
  cardLabel: string;
  cardValue: number;
  createdAt: number;
}

export interface SanitizedVote {
  userId: string;
  hasVoted: boolean;
  cardLabel?: string;
  cardValue?: number;
}

// Canvas related types
export interface CanvasNode {
  id: string;
  roomId: string;
  nodeId: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  isLocked: boolean;
  createdAt: number;
  updatedAt: number;
}

// Activity related types
export interface Activity {
  id: string;
  roomId: string;
  userId?: string;
  userName?: string;
  type: string;
  description?: string;
  createdAt: number;
}

// API route helper type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Composite types
export interface RoomWithRelatedData {
  room: Room;
  users: User[];
  votes: SanitizedVote[];
}

// For compatibility with old code
export type Doc<T extends string> = T extends 'rooms'
  ? Room
  : T extends 'users'
  ? User
  : T extends 'votes'
  ? Vote
  : T extends 'canvasNodes'
  ? CanvasNode
  : T extends 'activities'
  ? Activity
  : never;

