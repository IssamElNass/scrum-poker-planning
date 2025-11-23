"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import type { RoomWithRelatedData, Id } from "@/lib/types";

interface UseOwnershipNotificationProps {
  roomData: RoomWithRelatedData;
  currentUserId: Id<"users"> | undefined;
}

export function useOwnershipNotification({
  roomData,
  currentUserId,
}: UseOwnershipNotificationProps) {
  const { toast } = useToast();
  const previousOwnerIdRef = useRef<Id<"users"> | undefined>(undefined);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Don't run if currentUserId is not available
    if (!currentUserId) {
      // Reset initialization when user is not available
      hasInitializedRef.current = false;
      return;
    }

    const currentOwnerId = roomData.room.ownerId;

    // Initialize the ref on first load without showing notification
    if (!hasInitializedRef.current) {
      previousOwnerIdRef.current = currentOwnerId;
      hasInitializedRef.current = true;
      return;
    }

    // Check if ownership has changed
    if (
      previousOwnerIdRef.current &&
      previousOwnerIdRef.current !== currentOwnerId
    ) {
      const newOwner = roomData.users.find(
        (user) => user.id === currentOwnerId
      );

      if (newOwner) {
        // Show toast notification to all users
        toast({
          title: "Room ownership transferred",
          description: `${newOwner.name} is now the owner of this room`,
        });
      }
    }

    // Update the ref for next comparison
    previousOwnerIdRef.current = currentOwnerId;
  }, [roomData.room.ownerId, roomData.users, toast, currentUserId]);
}
