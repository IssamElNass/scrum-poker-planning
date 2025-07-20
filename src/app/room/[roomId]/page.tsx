"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RoomCanvas } from "@/components/room/room-canvas";
import { JoinRoomDialog } from "@/components/room/join-room-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { Id } from "@/convex/_generated/dataModel";

export default function CanvasRoomPage() {
  const params = useParams();
  const roomId = params.roomId as Id<"rooms">;
  const { user } = useAuth();
  const roomData = useQuery(api.rooms.get, { roomId });

  // Check if user is in this room
  const isInRoom = user?.roomId === roomId;

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
          <p className="text-muted-foreground">This room doesn&apos;t exist or has been deleted</p>
        </div>
      </div>
    );
  }

  if (!isInRoom) {
    return <JoinRoomDialog roomId={roomId} roomName={roomData.room.name} />;
  }

  return <RoomCanvas roomData={roomData} />;
}