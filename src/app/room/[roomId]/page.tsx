"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { JoinRoomDialog } from "@/components/room/join-room-dialog";
import { RoomCanvas } from "@/components/room/room-canvas";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function CanvasRoomPage() {
  const params = useParams();
  const roomId = params.roomId as Id<"rooms">;
  const { user, setUser } = useAuth();
  const roomData = useQuery(api.rooms.get, { roomId });
  const router = useRouter();
  const { toast } = useToast();
  const hasCheckedKick = useRef(false);

  // Check if user is in this room
  const isInRoom = user?.roomId === roomId;

  // Check if user was kicked - user thinks they're in room but room data doesn't include them
  const wasKicked =
    user &&
    user.roomId === roomId &&
    roomData?.users &&
    !roomData.users.some((u) => u._id === user.id);

  // Handle kicked user
  useEffect(() => {
    if (wasKicked && !hasCheckedKick.current) {
      hasCheckedKick.current = true;
      // Clear user from auth and localStorage
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
