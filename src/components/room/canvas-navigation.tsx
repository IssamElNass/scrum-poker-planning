"use client";

import { useReactFlow } from "@xyflow/react";
import {
  Copy,
  Download,
  Github,
  Grid3X3,
  Home,
  LogOut,
  Maximize2,
  QrCode,
  Settings,
  Share2,
  Users,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
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
import { api } from "@/convex/_generated/api";
import type { RoomWithRelatedData } from "@/convex/model/rooms";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import { ModeToggle } from "../mode-toggle";
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
  const leaveRoomMutation = useMutation(api.users.leave);
  const [isFullscreenSupported] = useState(
    () => typeof document !== "undefined" && document.fullscreenEnabled
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isGithubImportOpen, setIsGithubImportOpen] = useState(false);
  const [isJiraImportOpen, setIsJiraImportOpen] = useState(false);
  const [isMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );

  // Check if current user is room owner
  const isOwner = useQuery(
    api.rooms.isOwner,
    user && roomData?.room
      ? { roomId: roomData.room._id, userId: user.id }
      : "skip"
  );

  const handleCopyRoomUrl = async () => {
    if (roomData?.room) {
      const url = `${window.location.origin}/room/${roomData.room._id}`;
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
    if (!user) return;

    try {
      // Set flag to indicate voluntary leave (not kicked)
      localStorage.setItem("voluntaryLeave", "true");

      // Remove user from the room
      await leaveRoomMutation({ userId: user.id });

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
          {/* Logo/Home */}
          <Link href="/" className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={buttonClass}
                  aria-label="Back to home"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Back to home</p>
              </TooltipContent>
            </Tooltip>
          </Link>

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

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Room Info Section */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {room.name || `Room ${room._id.slice(0, 6)}`}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyRoomUrl}
                  className={buttonClass}
                  aria-label="Copy room URL"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy room link</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShowQRCode}
                  className={buttonClass}
                  aria-label="Show QR code"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show QR code</p>
              </TooltipContent>
            </Tooltip>
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
                <DropdownMenuItem disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Export results
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={buttonClass}
                  aria-label="Room settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setIsSettingsOpen(true)}
                  disabled={!isOwner}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Room settings
                </DropdownMenuItem>
              </DropdownMenuContent>
              <ModeToggle variant="ghost" />
            </DropdownMenu>
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
          url={`${typeof window !== "undefined" ? window.location.origin : ""}/room/${roomData.room._id}`}
          roomName={
            roomData.room.name || `Room ${roomData.room._id.slice(0, 6)}`
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
