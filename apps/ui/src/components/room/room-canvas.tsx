"use client";

import type { NodeChange } from "@xyflow/react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Edge,
  NodeTypes,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { debounce } from "lodash";
import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import * as apiClient from "@/lib/api-client";
import { Id, RoomWithRelatedData, SanitizedVote } from "@/lib/types";
import { CanvasNavigation } from "./canvas-navigation";
import { EmojiReactionsProvider } from "./emoji-reactions-provider";
import { useCanvasNodes } from "./hooks/useCanvasNodes";
import { useOwnershipNotification } from "./hooks/useOwnershipNotification";
import { useReactionBroadcastListener } from "./hooks/useReactionBroadcastListener";
import {
  PlayerNode,
  ResultsNode,
  SessionNode,
  StoryNode,
  TimerNode,
  VotingCardNode,
} from "./nodes";
import type { CustomNodeType } from "./types";

interface RoomCanvasProps {
  roomData: RoomWithRelatedData;
}

// Define node types outside component to prevent re-renders
const nodeTypes: NodeTypes = {
  player: PlayerNode,
  story: StoryNode,
  session: SessionNode,
  votingCard: VotingCardNode,
  results: ResultsNode,
  timer: TimerNode,
} as const;

function RoomCanvasInner({ roomData }: RoomCanvasProps): ReactElement {
  const { user } = useAuth();

  // Monitor ownership changes and show notifications
  useOwnershipNotification({
    roomData,
    currentUserId: user?.id as Id<"users"> | undefined,
  });

  // Listen for reaction broadcasts from other users
  useReactionBroadcastListener({
    roomData,
    currentUserId: user?.id,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();

  const handleRevealCards = useCallback(async () => {
    if (!roomData) return;
    try {
      await apiClient.revealVotes(roomData.room.id, true);
    } catch (error) {
      console.error("Failed to show cards:", error);
    }
  }, [roomData]);

  const handleResetGame = useCallback(async () => {
    if (!roomData) return;
    try {
      await apiClient.clearVotes(roomData.room.id);
    } catch (error) {
      console.error("Failed to reset game:", error);
    }
  }, [roomData]);

  const handleSubmitEstimation = useCallback(async () => {
    if (!roomData) return;

    // TODO: Implement submit estimation with server action
    console.log("Submit estimation not yet implemented");
  }, [roomData]);

  const handleSkipStory = useCallback(async () => {
    if (!roomData) return;

    // TODO: Implement skip story with server action
    console.log("Skip story not yet implemented");
  }, [roomData]);

  // Track selected cards locally (server doesn't send card value until reveal)
  const [selectedCardValue, setSelectedCardValue] = useState<string | null>(
    null
  );

  // Reset selected card when game is reset
  useEffect(() => {
    if (!roomData || !user) return;

    const userVote = roomData.votes.find(
      (v: SanitizedVote) => v.userId === user.id
    );

    // If no card is picked on server (game was reset), clear local selection
    if (!userVote || !userVote.hasVoted) {
      setSelectedCardValue(null);
    }
    // If game is revealed and we have a card value from server, sync it
    else if (roomData.room.isGameOver && userVote.cardLabel) {
      setSelectedCardValue(userVote.cardLabel);
    }
  }, [user, roomData]);

  // Handle card selection
  const handleCardSelect = useCallback(
    async (cardValue: string) => {
      if (!user || !roomData) return;

      setSelectedCardValue(cardValue);

      try {
        await apiClient.castVote(roomData.room.id, user.id, {
          cardLabel: cardValue,
          cardValue: parseInt(cardValue) || 0,
        });
      } catch (error) {
        console.error("Failed to pick card:", error);
        setSelectedCardValue(null);
      }
    },
    [user, roomData]
  );

  // Get room ID
  const roomId = roomData?.room.id as Id<"rooms">;

  // Use the canvas nodes hook to get persisted nodes
  const { nodes: layoutNodes, edges: layoutEdges } = useCanvasNodes({
    roomId,
    roomData,
    currentUserId: user?.id,
    selectedCardValue,
    onRevealCards: handleRevealCards,
    onResetGame: handleResetGame,
    onSubmitEstimation: handleSubmitEstimation,
    onSkipStory: handleSkipStory,
    onCardSelect: handleCardSelect,
  });

  // Update nodes and edges when layout changes
  useEffect(() => {
    setNodes(layoutNodes);
  }, [layoutNodes, setNodes]);

  useEffect(() => {
    setEdges(layoutEdges);
  }, [layoutEdges, setEdges]);

  // Debounced position update to prevent database overload
  const debouncedPositionUpdate = useMemo(
    () =>
      debounce((nodeId: string, position: { x: number; y: number }) => {
        if (!user || !roomId) return;

        apiClient
          .updateCanvasNode(roomId, nodeId, { position })
          .catch((error) => {
            console.error("Failed to update node position:", error);
          });
      }, 100),
    [roomId, user]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedPositionUpdate.cancel();
    };
  }, [debouncedPositionUpdate]);

  // Handle node position changes
  const handleNodesChange = useCallback(
    (changes: NodeChange<CustomNodeType>[]) => {
      // Call the original handler to update local state
      onNodesChange(changes);

      // Send position updates to database
      changes.forEach((change) => {
        if (change.type === "position" && change.position && !change.dragging) {
          debouncedPositionUpdate(change.id, change.position);
        }
      });
    },
    [onNodesChange, debouncedPositionUpdate]
  );

  // Handle connection between nodes - prevent manual connections
  const onConnect = useCallback(() => {
    // Manual connections are not allowed in this application
    return;
  }, []);

  // Fit view when users change with debounce
  useEffect(() => {
    if (!roomData?.users) return;

    const timeoutId = setTimeout(() => {
      fitView({
        padding: 0.1,
        duration: 800,
        maxZoom: 1.2,
        minZoom: 0.6,
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [roomData?.users, fitView]);

  // Presence heartbeat - TODO: Implement with Socket.io presence
  useEffect(() => {
    if (!user?.id || !roomData?.room.id) return;

    // TODO: Implement presence tracking with Socket.io
    // This should emit presence updates via socket instead of polling
    console.log("Presence tracking not yet fully implemented");
  }, [user?.id, roomData?.room.id]);

  if (!roomData || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      <CanvasNavigation roomData={roomData} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 50, zoom: 0.75 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        snapToGrid
        snapGrid={[25, 25]}
        preventScrolling={false}
        attributionPosition="bottom-right"
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        translateExtent={[
          [-2000, -2000],
          [2000, 2000],
        ]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="[&>*]:stroke-gray-300 dark:[&>*]:stroke-gray-700"
        />
      </ReactFlow>
    </div>
  );
}

export function RoomCanvas(props: RoomCanvasProps): ReactElement {
  return (
    <ReactFlowProvider>
      <EmojiReactionsProvider roomId={props.roomData.room.id}>
        <RoomCanvasInner {...props} />
      </EmojiReactionsProvider>
    </ReactFlowProvider>
  );
}
