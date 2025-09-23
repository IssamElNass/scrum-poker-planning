"use client";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import type { RoomWithRelatedData } from "@/convex/model/rooms";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import {
  Calendar,
  Crown,
  Eye,
  Hash,
  Save,
  Settings,
  UserMinus,
  Users,
} from "lucide-react";
import React, { useState } from "react";

interface RoomSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomData: RoomWithRelatedData;
  currentUserId: Id<"users">;
}

type SettingsTab = "general" | "members";

export function RoomSettingsDialog({
  isOpen,
  onOpenChange,
  roomData,
  currentUserId,
}: RoomSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [roomName, setRoomName] = useState(roomData.room.name);
  const [isUpdating, setIsUpdating] = useState(false);

  // User management state
  const [kickDialogOpen, setKickDialogOpen] = useState(false);
  const [ownershipDialogOpen, setOwnershipDialogOpen] = useState(false);
  const [selectedUserForKick, setSelectedUserForKick] =
    useState<Doc<"users"> | null>(null);
  const [selectedUserForOwnership, setSelectedUserForOwnership] =
    useState<Doc<"users"> | null>(null);

  const { toast } = useToast();
  const updateRoomName = useMutation(api.rooms.updateName);
  const kickUser = useMutation(api.users.kick);
  const transferOwnership = useMutation(api.users.transferOwnership);
  // const updatePresence = useMutation(api.canvas.updatePresence);

  const isOwner = useQuery(api.rooms.isOwner, {
    roomId: roomData.room._id,
    userId: currentUserId,
  });

  // Get active presence data for all users in the room
  // const activePresence = useQuery(api.canvas.getPresence, {
  //   roomId: roomData.room._id,
  // });

  // Helper function to check if a user is currently active
  // const isUserActive = (userId: Id<"users">) => {
  //   return (
  //     activePresence?.some(
  //       (presence) => presence.userId === userId && presence.isActive
  //     ) ?? false
  //   );
  // };

  const handleSaveRoomName = async () => {
    if (!roomName.trim()) {
      toast({
        title: "Invalid room name",
        description: "Room name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (roomName.trim() === roomData.room.name) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateRoomName({
        roomId: roomData.room._id,
        userId: currentUserId,
        name: roomName.trim(),
      });

      toast({
        title: "Room name updated",
        description: "Room name has been saved successfully",
      });
    } catch (error) {
      console.error("Failed to update room name:", error);
      toast({
        title: "Failed to update room name",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setRoomName(roomData.room.name); // Reset on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKick = async () => {
    if (!selectedUserForKick) return;

    try {
      await kickUser({
        roomId: roomData.room._id,
        userToKickId: selectedUserForKick._id,
        kickedById: currentUserId,
      });

      toast({
        title: "User kicked",
        description: `${selectedUserForKick.name} has been kicked from the room`,
      });
      setKickDialogOpen(false);
      setSelectedUserForKick(null);
    } catch (error) {
      console.error("Failed to kick user:", error);
      toast({
        title: "Failed to kick user",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedUserForOwnership) return;

    try {
      await transferOwnership({
        roomId: roomData.room._id,
        newOwnerId: selectedUserForOwnership._id,
        currentOwnerId: currentUserId,
      });

      setOwnershipDialogOpen(false);
      setSelectedUserForOwnership(null);
      // Close the settings dialog since the user is no longer the owner
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to transfer ownership:", error);
      toast({
        title: "Failed to transfer ownership",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleRoomNameChange = (value: string) => {
    setRoomName(value);
  };

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setRoomName(roomData.room.name);
      setActiveTab("general");
    }
  }, [isOpen, roomData.room.name]);

  // Close dialog if user is no longer owner
  React.useEffect(() => {
    if (isOpen && isOwner === false) {
      onOpenChange(false);
    }
  }, [isOpen, isOwner, onOpenChange]);

  // Update presence when dialog is open to keep user marked as active
  // useEffect(() => {
  //   if (!isOpen || !currentUserId) return;

  //   // Initial presence update when dialog opens
  //   updatePresence({
  //     roomId: roomData.room._id,
  //     userId: currentUserId,
  //     isActive: true,
  //   }).catch((error) => {
  //     console.error("Failed to update presence:", error);
  //   });

  //   // Set up heartbeat to maintain active status
  //   const heartbeatInterval = setInterval(() => {
  //     updatePresence({
  //       roomId: roomData.room._id,
  //       userId: currentUserId,
  //       isActive: true,
  //     }).catch((error) => {
  //       console.error("Failed to update presence:", error);
  //     });
  //   }, 30000); // Update every 30 seconds

  //   return () => {
  //     clearInterval(heartbeatInterval);
  //     // Mark as inactive when dialog closes
  //     updatePresence({
  //       roomId: roomData.room._id,
  //       userId: currentUserId,
  //       isActive: false,
  //     }).catch((error) => {
  //       console.error("Failed to update presence:", error);
  //     });
  //   };
  // }, [isOpen, currentUserId, roomData.room._id, updatePresence]);

  const sidebarItems = [
    {
      id: "general" as const,
      label: "General",
      icon: Settings,
      description: "Room name and basic settings",
    },
    {
      id: "members" as const,
      label: "Members",
      icon: Users,
      description: "Manage room participants",
    },
  ];

  const currentUser = roomData.users.find((user) => user._id === currentUserId);
  const otherUsers = roomData.users.filter(
    (user) => user._id !== currentUserId
  );
  const roomOwner = roomData.users.find(
    (user) => user._id === roomData.room.ownerId
  );

  // Don't render the dialog if user is not the owner
  if (isOwner === false) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90vw] max-w-6xl p-0 gap-0 max-h-[90vh] bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-0 shadow-2xl">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl" />
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl" />

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-20">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgb(99 102 241 / 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgb(99 102 241 / 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              />
            </div>
          </div>

          <DialogHeader className="relative px-8 py-6 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-slate-50/80 via-blue-50/80 to-purple-50/80 dark:from-gray-950/80 dark:via-blue-950/80 dark:to-purple-950/80 backdrop-blur-sm">
            <DialogTitle className="flex items-center gap-4">
              {/* Branding badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 px-3 py-1.5 ring-1 ring-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-primary">
                  Scrum Poker Planning
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl ring-1 ring-primary/30">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-gray-100 text-xl">
                    Room Settings
                  </div>
                  <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                    Configure your planning session
                  </div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="relative flex h-full min-h-0 flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-72 lg:w-80 border-r md:border-b-0 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-b from-white/80 via-slate-50/80 to-blue-50/80 dark:from-gray-950/80 dark:via-gray-900/80 dark:to-blue-950/80 backdrop-blur-sm">
              <div className="relative p-6 space-y-3">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`group w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 relative overflow-hidden ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 text-primary border-2 border-primary/20 shadow-lg shadow-primary/10"
                        : "hover:bg-white/70 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50 hover:shadow-md"
                    }`}
                  >
                    {/* Hover effect background */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div
                      className={`relative p-3 rounded-xl transition-all duration-300 ${
                        activeTab === item.id
                          ? "bg-gradient-to-br from-primary/20 to-purple-500/20 ring-1 ring-primary/30"
                          : "bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 transition-colors duration-300 ${
                          activeTab === item.id
                            ? "text-primary"
                            : "text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                        }`}
                      />
                    </div>
                    <div className="relative flex-1">
                      <div
                        className={`font-semibold text-base transition-colors duration-300 ${
                          activeTab === item.id ? "text-primary" : ""
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.description}
                      </div>
                    </div>

                    {/* Active indicator */}
                    {activeTab === item.id && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="relative flex-1 overflow-y-auto bg-gradient-to-br from-white/50 via-slate-50/50 to-blue-50/50 dark:from-gray-950/50 dark:via-gray-900/50 dark:to-blue-950/50">
              <div className="p-6 md:p-8 lg:p-10">
                {activeTab === "general" && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl ring-1 ring-emerald-500/30">
                          <Settings className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            General Settings
                          </h3>
                          <p className="text-base text-gray-600 dark:text-gray-400">
                            Configure your planning session properties
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 md:p-8 space-y-6 md:space-y-8 shadow-lg shadow-gray-200/20 dark:shadow-gray-900/20">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="room-name"
                              className="text-base font-semibold text-gray-900 dark:text-gray-100"
                            >
                              Session Name
                            </Label>
                            {!isOwner && (
                              <span className="text-xs text-amber-600 dark:text-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 px-3 py-1.5 rounded-full ring-1 ring-amber-200 dark:ring-amber-800">
                                Owner only
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4">
                            <Input
                              id="room-name"
                              value={roomName}
                              onChange={(e) =>
                                handleRoomNameChange(e.target.value)
                              }
                              placeholder="Enter your planning session name"
                              disabled={!isOwner || isUpdating}
                              className="flex-1 h-12 text-base rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            {roomName !== roomData.room.name && (
                              <Button
                                onClick={handleSaveRoomName}
                                disabled={!isOwner || isUpdating}
                                className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                {isUpdating ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                  </div>
                                ) : (
                                  "Save"
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-6">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3 text-lg">
                            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg">
                              <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            Session Information
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                              <div className="flex items-center gap-3 text-sm text-blue-600 dark:text-blue-400 mb-3">
                                <Calendar className="h-5 w-5" />
                                Created
                              </div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                {new Date(
                                  roomData.room.createdAt
                                ).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50">
                              <div className="flex items-center gap-3 text-sm text-purple-600 dark:text-purple-400 mb-3">
                                <Hash className="h-5 w-5" />
                                Session ID
                              </div>
                              <div className="font-mono text-sm bg-white/70 dark:bg-gray-800/70 px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-gray-100 backdrop-blur-sm">
                                {roomData.room._id}
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-6">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3 text-lg">
                              <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              Session Statistics
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg shadow-emerald-200/10 dark:shadow-emerald-900/10">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl ring-1 ring-emerald-500/30">
                                    <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                                      {roomData.users.length}
                                    </div>
                                    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                      Total Members
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50 shadow-lg shadow-blue-200/10 dark:shadow-blue-900/10">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl ring-1 ring-blue-500/30">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                                      {
                                        roomData.users.filter(
                                          (u) => !u.isSpectator
                                        ).length
                                      }
                                    </div>
                                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                      Participants
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50 shadow-lg shadow-purple-200/10 dark:shadow-purple-900/10">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl ring-1 ring-purple-500/30">
                                    <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                                      {
                                        roomData.users.filter(
                                          (u) => u.isSpectator
                                        ).length
                                      }
                                    </div>
                                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                      Observers
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "members" && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl ring-1 ring-purple-500/30">
                          <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Session Members
                          </h3>
                          <p className="text-base text-gray-600 dark:text-gray-400">
                            Manage participants and observers
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                        {/* Current User */}
                        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/50 dark:to-indigo-950/50 backdrop-blur-sm rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/50 p-5 shadow-lg shadow-blue-200/10 dark:shadow-blue-900/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                              <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-xl ring-2 ring-blue-200 dark:ring-blue-800">
                                  {currentUser?.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3 text-lg">
                                  {currentUser?.name}
                                  <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-full font-semibold shadow-md">
                                    You
                                  </span>
                                  {currentUser?._id === roomOwner?._id && (
                                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ring-yellow-200 dark:ring-yellow-800">
                                      <Crown className="h-3.5 w-3.5" />
                                      Owner
                                    </div>
                                  )}
                                </div>
                                <div className="text-base text-gray-600 dark:text-gray-400 flex items-center gap-3 mt-2">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                                      currentUser?.isSpectator
                                        ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800"
                                        : "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800"
                                    }`}
                                  >
                                    {currentUser?.isSpectator ? (
                                      <>
                                        <Eye className="h-3.5 w-3.5" />
                                        Observer
                                      </>
                                    ) : (
                                      <>
                                        <Users className="h-3.5 w-3.5" />
                                        Participant
                                      </>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Other Users */}
                        {otherUsers.map((user) => (
                          <div
                            key={user._id}
                            className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 hover:shadow-lg transition-all duration-300 hover:border-gray-300/50 dark:hover:border-gray-600/50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-5">
                                <div className="relative">
                                  <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg ring-2 ring-gray-200 dark:ring-gray-700">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3 text-lg">
                                    {user.name}
                                    {user._id === roomOwner?._id && (
                                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ring-yellow-200 dark:ring-yellow-800">
                                        <Crown className="h-3.5 w-3.5" />
                                        Owner
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-base text-gray-600 dark:text-gray-400 flex items-center gap-3 mt-2">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                                        user.isSpectator
                                          ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800"
                                          : "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800"
                                      }`}
                                    >
                                      {user.isSpectator ? (
                                        <>
                                          <Eye className="h-3.5 w-3.5" />
                                          Observer
                                        </>
                                      ) : (
                                        <>
                                          <Users className="h-3.5 w-3.5" />
                                          Participant
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions for room owner */}
                              {isOwner && user._id !== roomOwner?._id && (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUserForOwnership(user);
                                      setOwnershipDialogOpen(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-sm rounded-xl px-4 py-2 font-medium shadow-sm hover:shadow-md transition-all duration-300"
                                  >
                                    <Crown className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">
                                      Make Owner
                                    </span>
                                    <span className="sm:hidden">Owner</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUserForKick(user);
                                      setKickDialogOpen(true);
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-800 text-sm rounded-xl px-4 py-2 font-medium shadow-sm hover:shadow-md transition-all duration-300"
                                  >
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Kick
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {otherUsers.length === 0 && (
                          <div className="text-center py-16 bg-gradient-to-br from-gray-50/80 to-blue-50/80 dark:from-gray-800/30 dark:to-blue-950/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300/50 dark:border-gray-600/50">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-700 dark:to-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-gray-200 dark:ring-gray-600">
                              <Users className="h-10 w-10 text-gray-500 dark:text-gray-400" />
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-lg">
                              No other members yet
                            </h4>
                            <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                              Share the session link to invite your team members
                              and start collaborative planning
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Kick Confirmation Dialog */}
      <AlertDialog open={kickDialogOpen} onOpenChange={setKickDialogOpen}>
        <AlertDialogContent className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-0 shadow-2xl">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl ring-1 ring-red-500/30">
                <UserMinus className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              Remove Member
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {selectedUserForKick?.name}
              </span>{" "}
              from this planning session? This action cannot be undone and they
              will need to rejoin using the session link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="rounded-xl px-6 py-3 font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleKick}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl px-6 py-3 shadow-lg shadow-red-600/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-600/40"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Ownership Confirmation Dialog */}
      <AlertDialog
        open={ownershipDialogOpen}
        onOpenChange={setOwnershipDialogOpen}
      >
        <AlertDialogContent className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-0 shadow-2xl">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl ring-1 ring-yellow-500/30">
                <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              Transfer Ownership
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Are you sure you want to make{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {selectedUserForOwnership?.name}
              </span>{" "}
              the new session owner? You will lose your owner privileges and
              they will be able to manage the session settings and members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="rounded-xl px-6 py-3 font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransferOwnership}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl px-6 py-3 shadow-lg shadow-blue-600/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-600/40"
            >
              <Crown className="h-4 w-4 mr-2" />
              Transfer Ownership
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
