"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { JoinRoomDialog } from "@/components/room/join-room-dialog";
import { RoomCanvas } from "@/components/room/room-canvas";
import { useRoomSocket, useSocketEvent } from "@/components/socket-provider";
import { useToast } from "@/hooks/use-toast";
import { Id, RoomWithRelatedData } from "@/lib/types";
import { debounce } from "lodash";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast as sonnerToast } from "sonner";

export default function CanvasRoomPage() {
  const params = useParams();
  const roomId = params.roomId as Id<"rooms">;
  const { user, setUser } = useAuth();
  const [roomData, setRoomData] = useState<RoomWithRelatedData | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const hasCheckedKick = useRef(false);
  const justJoinedRef = useRef<number>(Date.now()); // Initialize to now to provide grace period on mount

  // Join room via Socket.io (establishes connection and joins room)
  useRoomSocket(roomId);

  // Check if user is in this room
  const isInRoom = user?.roomId === roomId;
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch initial room data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const BACKEND_URL =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const response = await fetch(`${BACKEND_URL}/api/rooms/${roomId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setRoomData(result.data);
          }
          setIsInitialLoad(false);
        }
      } catch (error) {
        console.error("Failed to fetch room data:", error);
        setIsInitialLoad(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  // Mark when user joins and immediately refetch to prevent false kick detection
  useEffect(() => {
    if (user?.roomId === roomId) {
      // Mark that user just joined - prevents kick check for 5 seconds
      justJoinedRef.current = Date.now();

      // Immediately refetch room data (bypass debounce) to get updated user list
      const fetchRoomData = async () => {
        try {
          const BACKEND_URL =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
          const response = await fetch(`${BACKEND_URL}/api/rooms/${roomId}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setRoomData(result.data);
            }
          }
        } catch (error) {
          console.error("Failed to refetch room data:", error);
        }
      };

      fetchRoomData();
    }
  }, [user?.roomId, roomId]);

  // Refetch room data from API (debounced to prevent excessive calls)
  const refetchRoomData = useMemo(
    () =>
      debounce(async () => {
        try {
          const BACKEND_URL =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
          const response = await fetch(`${BACKEND_URL}/api/rooms/${roomId}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setRoomData(result.data);
            }
          }
        } catch (error) {
          console.error("Failed to refetch room data:", error);
        }
      }, 300),
    [roomId]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      refetchRoomData.cancel();
    };
  }, [refetchRoomData]);

  // Listen for user events and refetch room data
  const handleUserConnected = useCallback(
    (data: { userId: string; userName: string }) => {
      console.log("User connected:", data);
      // Reset grace period to prevent false kick detection during sync
      justJoinedRef.current = Date.now();
      refetchRoomData();
    },
    [refetchRoomData]
  );

  const handleUserDisconnected = useCallback(
    (data: { userId: string; userName: string }) => {
      console.log("User disconnected:", data);
      refetchRoomData();

      // Show notification if not the current user
      if (user && data.userName !== user.name) {
        sonnerToast.info(`${data.userName} left the room`);
      }
    },
    [refetchRoomData, user]
  );

  const handleUserKicked = useCallback(
    (data: { userId: string; userName: string }) => {
      console.log("User kicked:", data);
      refetchRoomData();
    },
    [refetchRoomData]
  );

  const handleUserUpdated = useCallback(
    (data: { user: { id: string; name: string; isSpectator: boolean } }) => {
      console.log("User updated:", data);
      refetchRoomData();
    },
    [refetchRoomData]
  );

  // Listen for socket events
  useSocketEvent("user-connected", handleUserConnected);
  useSocketEvent("user-disconnected", handleUserDisconnected);
  useSocketEvent("user-kicked", handleUserKicked);
  useSocketEvent("user-updated", handleUserUpdated);

  // Check if user was kicked - user thinks they're in room but room data doesn't include them
  // Only check after initial load and after grace period to avoid false positives
  const timeSinceJoin = Date.now() - justJoinedRef.current;
  const isInGracePeriod = timeSinceJoin < 5000; // 5 second grace period after joining (accounts for network latency)

  const wasKicked =
    !isInitialLoad &&
    !isInGracePeriod &&
    user &&
    user.roomId === roomId &&
    roomData?.users &&
    roomData.users.length > 0 && // Make sure we have user data loaded
    !roomData.users.some((u) => u.id === user.id);

  // Handle kicked user
  useEffect(() => {
    if (wasKicked && !hasCheckedKick.current) {
      hasCheckedKick.current = true;

      // Check if this was a voluntary leave
      const isVoluntaryLeave =
        localStorage.getItem("voluntaryLeave") === "true";
      localStorage.removeItem("voluntaryLeave");

      if (isVoluntaryLeave) {
        // User voluntarily left, just clear state and redirect
        setUser(null);
        router.push("/");
        return;
      }

      // User was kicked
      setUser(null);

      // Show warning toast
      toast({
        title: "You were kicked from the room",
        description:
          "You have been removed from the room by the owner. Redirecting to homepage...",
        variant: "destructive",
      });

      // Redirect to homepage after a short delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  }, [wasKicked, setUser, toast, router]);

  if (!roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Fetching room data</p>
        </div>
      </div>
    );
  }

  if (!roomData.room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Room Not Found</h2>
          <p className="text-muted-foreground">
            This room doesn&apos;t exist or has been deleted
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while handling kicked user
  if (wasKicked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-600">
            You were kicked from the room
          </h2>
          <p className="text-muted-foreground">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  if (!isInRoom) {
    return (
      <JoinRoomDialog
        roomId={roomId}
        roomName={roomData.room.name}
        roomData={roomData}
      />
    );
  }

  return <RoomCanvas roomData={roomData} />;
}
