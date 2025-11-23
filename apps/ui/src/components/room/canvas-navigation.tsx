"use client";

import { useReactFlow } from "@xyflow/react";
import {
  Copy,
  Download,
  Grid3X3,
  LogOut,
  Maximize2,
  QrCode,
  Settings,
  Share2,
  Users,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import * as apiClient from "@/lib/api-client";
import type { RoomWithRelatedData } from "@/lib/types";
import { ModeToggle } from "../mode-toggle";
import { EmojiPicker } from "./emoji-picker";
import { QRCodeDisplay } from "./qr-code-display";
import { RoomSettingsDialog } from "./room-settings-dialog";

interface CanvasNavigationProps {
  roomData: RoomWithRelatedData;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const CanvasNavigation: FC<CanvasNavigationProps> = ({
  roomData,
  onToggleFullscreen,
  isFullscreen = false,
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { toast } = useToast();
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [isFullscreenSupported] = useState(
    () => typeof document !== "undefined" && document.fullscreenEnabled
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );

  // Check if current user is room owner (computed from roomData)
  const isOwner = user && roomData?.room && roomData.room.ownerId === user.id;

  const handleCopyRoomUrl = async () => {
    if (roomData?.room) {
      const url = `${window.location.origin}/room/${roomData.room.id}`;
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Room URL copied!",
          description: "Share this link with others to join the room.",
        });
      } catch {
        toast({
          title: "Failed to copy URL",
          description: "Please copy the URL from your browser's address bar.",
          variant: "destructive",
        });
      }
    }
  };

  const handleShowQRCode = () => {
    setIsQRCodeOpen(true);
  };

  const handleZoomIn = () => {
    zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 300 });
  };

  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 300 });
  };

  const handleFullscreen = () => {
    if (!isFullscreenSupported) return;

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }

    onToggleFullscreen?.();
  };

  const handleLeaveRoom = async () => {
    if (!user || !roomData?.room) return;

    try {
      // Set flag to indicate voluntary leave (not kicked)
      localStorage.setItem("voluntaryLeave", "true");

      // Remove user from the room
      const result = await apiClient.leaveRoom(roomData.room.id, user.id);

      if (!result.success) {
        throw new Error(result.error || "Failed to leave room");
      }

      // Clear user from context immediately
      setUser(null);

      // Navigate to home
      router.push("/");

      // Clean up the flag after navigation
      setTimeout(() => {
        localStorage.removeItem("voluntaryLeave");
      }, 100);
    } catch (error) {
      // Clear flag if leave failed
      localStorage.removeItem("voluntaryLeave");
      toast({
        title: "Failed to leave room",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const buttonClass =
    "h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors";

  if (!roomData) return null;

  const { room, users } = roomData;

  return (
    <>
      {/* Left Navigation Bar */}
      <div
        className="absolute top-4 left-4 z-50"
        role="navigation"
        aria-label="Canvas Room Controls"
        data-testid="canvas-navigation"
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          {/* Room Info Section */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {room.name || `Room ${room.id.slice(0, 6)}`}
            </span>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Users Section */}
          <div className="flex items-center gap-2 px-2">
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {users.length} {users.length === 1 ? "user" : "users"}
            </span>
          </div>

          {/* Story Selector */}
          <Separator orientation="vertical" className="h-6 mx-1" />
        </div>
      </div>

      {/* Right Navigation Bar */}
      <div
        className="absolute top-4 right-4 z-50"
        data-testid="canvas-zoom-controls"
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className={buttonClass}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom out</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className={buttonClass}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom in</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFitView}
                  className={buttonClass}
                  aria-label="Fit view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fit to view</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Additional Actions */}
          <div className="flex items-center gap-1 px-2">
            {/* Emoji Reactions */}
            {user && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <EmojiPicker
                      roomId={roomData.room.id}
                      userId={user.id}
                      userName={user.name}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>React with emoji</p>
                </TooltipContent>
              </Tooltip>
            )}

            {isFullscreenSupported && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFullscreen}
                    className={buttonClass}
                    aria-label="Toggle fullscreen"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}</p>
                </TooltipContent>
              </Tooltip>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={buttonClass}
                  aria-label="Share and export options"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopyRoomUrl}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy room link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShowQRCode}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Show QR code
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Export results
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSettingsOpen(true)}
                  disabled={!isOwner}
                  className={buttonClass}
                  aria-label="Room settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isOwner ? "Room settings" : "Room settings (owner only)"}
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLeaveDialogOpen(true)}
                  className={buttonClass}
                  aria-label="Leave room"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Leave room</p>
              </TooltipContent>
            </Tooltip>

            <ModeToggle variant="ghost" />
          </div>
        </div>
      </div>
      {/* Room Settings Dialog */}
      {user && (
        <RoomSettingsDialog
          isOpen={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          roomData={roomData}
          currentUserId={user.id}
        />
      )}

      {/* QR Code Display */}
      {roomData?.room && (
        <QRCodeDisplay
          url={`${
            typeof window !== "undefined" ? window.location.origin : ""
          }/room/${roomData.room.id}`}
          roomName={
            roomData.room.name || `Room ${roomData.room.id.slice(0, 6)}`
          }
          isOpen={isQRCodeOpen}
          onClose={() => setIsQRCodeOpen(false)}
          isMobile={isMobile}
        />
      )}

      {/* Leave Room Confirmation Dialog */}
      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Room?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this room? You can always rejoin
              using the room link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveRoom}>
              Leave Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
