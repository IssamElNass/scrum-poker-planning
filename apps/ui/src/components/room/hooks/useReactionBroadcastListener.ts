"use client";

import type { RoomWithRelatedData } from "@/lib/types";
import type { EmojiType } from "@/lib/lottie-animations";
import { useEffect, useRef } from "react";
import { useEmojiReactions } from "../emoji-reactions-provider";

interface UseReactionBroadcastListenerProps {
  roomData: RoomWithRelatedData;
  currentUserId?: string;
}

export function useReactionBroadcastListener({
  roomData,
  currentUserId,
}: UseReactionBroadcastListenerProps) {
  const { addReaction } = useEmojiReactions();
  const previousReactionsRef = useRef<
    Map<string, { type: EmojiType; timestamp: number }>
  >(new Map());

  useEffect(() => {
    if (!roomData?.users) return;

    const { users } = roomData;

    users.forEach((user) => {
      // Skip current user's reactions (they already add their own)
      if (user.id === currentUserId) return;

      // Check if this user has a recent reaction
      if (user.lastReactionType && user.lastReactionAt) {
        const previousReaction = previousReactionsRef.current.get(user.id);

        // Check if this is a new reaction (different timestamp)
        if (
          !previousReaction ||
          previousReaction.timestamp !== user.lastReactionAt
        ) {
          // Only add if the reaction is recent (within last 5 seconds to account for network delay)
          const timeSinceReaction = Date.now() - user.lastReactionAt;
          if (timeSinceReaction < 5000) {
            addReaction(user.id, user.name, user.lastReactionType);

            // Update our tracking
            previousReactionsRef.current.set(user.id, {
              type: user.lastReactionType,
              timestamp: user.lastReactionAt,
            });
          }
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomData?.users, currentUserId, addReaction]);
}
