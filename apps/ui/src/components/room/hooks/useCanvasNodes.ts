"use client";

import { useSocketEvent } from "@/components/socket-provider";
import {
  CanvasNode,
  Id,
  RoomWithRelatedData,
  SanitizedVote,
  User,
} from "@/lib/types";
import { Edge } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useEmojiReactions } from "../emoji-reactions-provider";
import type { CustomNodeType } from "../types";

interface UseCanvasNodesProps {
  roomId: Id<"rooms">;
  roomData: RoomWithRelatedData;
  currentUserId?: string;
  selectedCardValue: string | null;
  onRevealCards?: () => void;
  onResetGame?: () => void;
  onSubmitEstimation?: () => void;
  onSkipStory?: () => void;
  onCardSelect?: (cardValue: string) => void;
}

interface UseCanvasNodesReturn {
  nodes: CustomNodeType[];
  edges: Edge[];
}

export function useCanvasNodes({
  roomId,
  roomData,
  currentUserId,
  selectedCardValue,
  onRevealCards,
  onResetGame,
  onSubmitEstimation,
  onSkipStory,
  onCardSelect,
}: UseCanvasNodesProps): UseCanvasNodesReturn {
  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { getReactionsForUser } = useEmojiReactions();

  // Fetch canvas nodes from backend API
  useEffect(() => {
    const fetchCanvasNodes = async () => {
      try {
        const BACKEND_URL =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const response = await fetch(`${BACKEND_URL}/api/canvas/${roomId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const nodes = Array.isArray(result.data) ? result.data : [];
            setCanvasNodes(nodes);
            setIsInitialized(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch canvas nodes:", error);
        setIsInitialized(true);
      }
    };

    fetchCanvasNodes();
  }, [roomId]);

  // Create default nodes if none exist
  useEffect(() => {
    if (!isInitialized || !roomData || !currentUserId || canvasNodes.length > 0)
      return;

    const createDefaultNodes = async () => {
      const { users } = roomData;

      try {
        const BACKEND_URL =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

        // Create all nodes in parallel for better performance
        const playerSpacing = 250;
        const startX = -((users.length - 1) * playerSpacing) / 2;

        const nodeCreationPromises = [
          // Session node
          fetch(`${BACKEND_URL}/api/canvas/${roomId}/nodes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nodeId: "session-current",
              type: "session",
              position: { x: 0, y: 100 },
              data: {},
              lastUpdatedBy: currentUserId,
            }),
          }),
          // Timer node
          fetch(`${BACKEND_URL}/api/canvas/${roomId}/nodes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nodeId: "timer",
              type: "timer",
              position: { x: -350, y: 100 },
              data: {},
              lastUpdatedBy: currentUserId,
            }),
          }),
          // Player nodes
          ...users.map((user, i) =>
            fetch(`${BACKEND_URL}/api/canvas/${roomId}/nodes`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nodeId: `player-${user.id}`,
                type: "player",
                position: { x: startX + i * playerSpacing, y: 350 },
                data: { userId: user.id },
                lastUpdatedBy: currentUserId,
              }),
            })
          ),
        ];

        // Wait for all nodes to be created in parallel
        await Promise.all(nodeCreationPromises);

        // Refetch nodes after creation
        const response = await fetch(`${BACKEND_URL}/api/canvas/${roomId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setCanvasNodes(Array.isArray(result.data) ? result.data : []);
          }
        }
      } catch (error) {
        console.error("Failed to create default nodes:", error);
      }
    };

    createDefaultNodes();
  }, [isInitialized, roomData, currentUserId, roomId, canvasNodes.length]);

  // Listen for canvas updates via Socket.io
  const handleCanvasUpdate = useCallback((data: { nodes: CanvasNode[] }) => {
    if (data.nodes && Array.isArray(data.nodes)) {
      setCanvasNodes(data.nodes);
    }
  }, []);

  useSocketEvent("canvas-update", handleCanvasUpdate);

  const nodes = useMemo(() => {
    if (!canvasNodes || !roomData) return [];

    const { room, users, votes } = roomData;
    const allNodes: CustomNodeType[] = [];

    // Process each canvas node
    canvasNodes.forEach((node) => {
      if (node.type === "player") {
        const userId = node.data.userId as string;
        const user = users.find((u: User) => u.id === userId);
        if (!user) return;

        const userVote = votes.find((v: SanitizedVote) => v.userId === userId);

        // Get active reactions for this user from context
        const userReactions = getReactionsForUser(userId);

        const playerNode: CustomNodeType = {
          id: node.nodeId,
          type: "player",
          position: node.position,
          data: {
            user,
            isCurrentUser: userId === currentUserId,
            isCardPicked: userVote?.hasVoted || false,
            card: room.isGameOver ? userVote?.cardLabel || null : null,
            activeReactions: userReactions.map((r) => ({
              id: r.id,
              emojiType: r.emojiType,
              timestamp: r.timestamp,
            })),
          },
          draggable: !node.isLocked,
        };
        allNodes.push(playerNode);
      } else if (node.type === "timer") {
        const timerNode: CustomNodeType = {
          id: node.nodeId,
          type: "timer",
          position: node.position,
          data: {
            ...node.data,
            roomId,
            userId: currentUserId,
            nodeId: node.nodeId,
          } as any,
          draggable: !node.isLocked,
        };
        allNodes.push(timerNode);
      } else if (node.type === "session") {
        const sessionNode: CustomNodeType = {
          id: node.nodeId,
          type: "session",
          position: node.position,
          data: {
            sessionName: room.name || "Planning Session",
            participantCount: users.length,
            voteCount: votes.filter((v: SanitizedVote) => v.hasVoted).length,
            isVotingComplete: room.isGameOver,
            hasVotes: votes.some((v: SanitizedVote) => v.hasVoted),
            hasActiveStory: !!room.activeStoryNodeId,
            onRevealCards,
            onResetGame,
            onSubmitEstimation,
            onSkipStory,
          },
          draggable: !node.isLocked,
        };
        allNodes.push(sessionNode);
      } else if (node.type === "votingCard") {
        // Only show voting cards for current user
        if (node.data.userId === currentUserId) {
          const votingCardNode: CustomNodeType = {
            id: node.nodeId,
            type: "votingCard",
            position: node.position,
            data: {
              ...node.data,
              roomId,
              isSelectable: !room.isGameOver,
              isSelected:
                (node.data.card as { value: string }).value ===
                selectedCardValue,
              onCardSelect,
            } as any,
            selected:
              (node.data.card as { value: string }).value === selectedCardValue,
            draggable: false,
          };
          allNodes.push(votingCardNode);
        }
      } else if (node.type === "results" && room.isGameOver) {
        const resultsNode: CustomNodeType = {
          id: node.nodeId,
          type: "results",
          position: node.position,
          data: {
            votes: votes.filter((v: SanitizedVote) => v.hasVoted),
            users: users,
          },
          draggable: !node.isLocked,
        };
        allNodes.push(resultsNode);
      }
    });

    return allNodes;
  }, [
    canvasNodes,
    roomData,
    currentUserId,
    selectedCardValue,
    onRevealCards,
    onResetGame,
    onSubmitEstimation,
    onSkipStory,
    onCardSelect,
    roomId,
    getReactionsForUser,
  ]);

  const edges = useMemo(() => {
    if (!canvasNodes || !roomData) return [];

    const { room, users } = roomData;
    const allEdges: Edge[] = [];

    // Only create edges if there's an active story (which means session is shown)
    if (room.activeStoryNodeId) {
      // Story to Session edge
      allEdges.push({
        id: `story-to-session`,
        source: room.activeStoryNodeId,
        sourceHandle: "bottom",
        target: "session-current",
        targetHandle: "top",
        type: "default",
        animated: false,
        style: {
          stroke: "#8b5cf6",
          strokeWidth: 3,
          strokeOpacity: 0.9,
        },
      });
    }

    // Session to Players edges
    users.forEach((user: User) => {
      allEdges.push({
        id: `session-to-player-${user.id}`,
        source: "session-current",
        sourceHandle: "bottom",
        target: `player-${user.id}`,
        targetHandle: "top",
        type: "smoothstep",
        animated: false,
        style: {
          stroke: "#3b82f6",
          strokeWidth: 2,
          strokeOpacity: 0.8,
        },
      });
    });

    // Session to Results edge (when game is over)
    if (room.isGameOver) {
      allEdges.push({
        id: "session-to-results",
        source: "session-current",
        target: "results",
        type: "smoothstep",
        animated: true,
        style: {
          stroke: "#10b981",
          strokeWidth: 3,
        },
      });
    }

    // Timer to Session edge
    allEdges.push({
      id: "timer-to-session",
      source: "timer",
      sourceHandle: "right",
      target: "session-current",
      targetHandle: "left",
      type: "straight",
      animated: false,
      style: {
        stroke: "#64748b",
        strokeWidth: 2,
        strokeDasharray: "5,5",
        strokeOpacity: 0.6,
      },
    });

    return allEdges;
  }, [canvasNodes, roomData]);

  return { nodes, edges };
}
