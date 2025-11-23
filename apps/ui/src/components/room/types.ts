import type { User, Id, SanitizedVote } from "@/lib/types";
import type { EmojiType } from "@/lib/lottie-animations";
import { Node } from "@xyflow/react";

// Emoji reaction type
export type ActiveEmojiReaction = {
  id: string;
  emojiType: EmojiType;
  timestamp: number;
};

// Node data types
export type PlayerNodeData = {
  user: User;
  isCurrentUser: boolean;
  isCardPicked: boolean;
  card: string | null;
  activeReactions?: ActiveEmojiReaction[];
};

export type StoryNodeData = {
  title: string;
  description: string;
  storyId: string;
  isGameOver?: boolean;
  hasVotes?: boolean;
  onRevealCards?: () => void;
  onResetGame?: () => void;
  // GitHub integration fields
  githubIssueNumber?: number;
  githubIssueUrl?: string;
  estimateExported?: boolean;
  lastExportedEstimate?: string;
  lastExportedAt?: number;
};

export type SessionNodeData = {
  sessionName: string;
  participantCount: number;
  voteCount: number;
  isVotingComplete: boolean;
  hasVotes: boolean;
  hasActiveStory?: boolean;
  onRevealCards?: () => void;
  onResetGame?: () => void;
  onSubmitEstimation?: () => void;
  onSkipStory?: () => void;
};

export type TimerNodeData = {
  // Synchronized timer state fields
  startedAt: number | null; // Server timestamp when started
  pausedAt: number | null; // Server timestamp when paused
  elapsedSeconds: number; // Total elapsed seconds
  isRunning: boolean; // Current running state (derived from timestamps)

  // Tracking fields
  lastUpdatedBy: Id<"users"> | null; // User who last changed timer
  lastAction: "start" | "pause" | "reset" | null; // Last action performed

  // Required fields for timer synchronization
  roomId: Id<"rooms">; // Room ID for timer sync
  userId?: Id<"users">; // Current user ID for timer controls
  nodeId: string; // Node ID for timer sync
};

export type VotingCardNodeData = {
  card: { value: string };
  userId: string;
  roomId: string;
  isSelectable: boolean;
  isSelected: boolean;
  onCardSelect?: (cardValue: string) => void;
};

export type ResultsNodeData = {
  votes: SanitizedVote[];
  users: User[];
};

// Node types
export type PlayerNodeType = Node<PlayerNodeData, "player">;
export type StoryNodeType = Node<StoryNodeData, "story">;
export type SessionNodeType = Node<SessionNodeData, "session">;
export type TimerNodeType = Node<TimerNodeData, "timer">;
export type VotingCardNodeType = Node<VotingCardNodeData, "votingCard">;
export type ResultsNodeType = Node<ResultsNodeData, "results">;

// Union type for all custom nodes
export type CustomNodeType =
  | PlayerNodeType
  | StoryNodeType
  | SessionNodeType
  | TimerNodeType
  | VotingCardNodeType
  | ResultsNodeType;
