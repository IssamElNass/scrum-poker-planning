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
        <DialogContent className="w-[80vw] p-0 gap-0 max-h-[800px]">
          <DialogHeader className="px-6 py-3 md:h-[100px] h-[100px] max-h-[80px] border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
            <DialogTitle className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  Room Settings
                </div>
                <div className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  Manage your room configuration and members
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex h-full min-h-0 flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 lg:w-72 border-r md:border-b-0 border-b bg-gradient-to-b from-gray-50/80 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/30">
              <div className="p-4 md:p-6 space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-300 border-2 border-blue-200/50 dark:border-blue-800/50 shadow-sm"
                        : "hover:bg-white/70 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        activeTab === item.id
                          ? "bg-blue-100 dark:bg-blue-900/50"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${
                          activeTab === item.id
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-6 lg:p-8">
                {activeTab === "general" && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                          <Settings className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                            General Settings
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Configure basic room properties
                          </p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 space-y-4 md:space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="room-name"
                              className="text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                              Room Name
                            </Label>
                            {!isOwner && (
                              <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md">
                                Owner only
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <Input
                              id="room-name"
                              value={roomName}
                              onChange={(e) =>
                                handleRoomNameChange(e.target.value)
                              }
                              placeholder="Enter room name"
                              disabled={!isOwner || isUpdating}
                              className="flex-1 h-11 text-base"
                            />
                            {roomName !== roomData.room.name && (
                              <Button
                                onClick={handleSaveRoomName}
                                disabled={!isOwner || isUpdating}
                                className="h-11 px-6"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                {isUpdating ? "Saving..." : "Save"}
                              </Button>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            Room Information
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="h-4 w-4" />
                                Created
                              </div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
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
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Hash className="h-4 w-4" />
                                Room ID
                              </div>
                              <div className="font-mono text-sm bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border">
                                {roomData.room._id}
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Room Statistics
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                                    <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div>
                                    <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                                      {/* {activePresence?.length || 0} /{" "} */}
                                      {roomData.users.length}
                                    </div>
                                    <div className="text-xs text-emerald-600 dark:text-emerald-400">
                                      {/* Active / Total Members */}
                                      Total Members
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div>
                                    <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                      {/* {
                                        roomData.users.filter(
                                          (u) =>
                                            !u.isSpectator &&
                                            isUserActive(u._id)
                                        ).length
                                      }{" "}
                                      /{" "} */}
                                      {
                                        roomData.users.filter(
                                          (u) => !u.isSpectator
                                        ).length
                                      }
                                    </div>
                                    <div className="text-xs text-blue-600 dark:text-blue-400">
                                      {/* Active / Total Participants */}
                                      Total Participants
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                    <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div>
                                    <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                                      {/* {
                                        roomData.users.filter(
                                          (u) =>
                                            u.isSpectator && isUserActive(u._id)
                                        ).length
                                      }{" "}
                                      /{" "} */}
                                      {
                                        roomData.users.filter(
                                          (u) => u.isSpectator
                                        ).length
                                      }
                                    </div>
                                    <div className="text-xs text-purple-600 dark:text-purple-400">
                                      {/* Active / Total Spectators */}
                                      Total Spectators
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
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Room Members
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage users and permissions
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {/* Current User */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-3 md:p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-lg">
                                  {currentUser?.name.charAt(0).toUpperCase()}
                                </div>
                                {/* <div
                                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                                    isUserActive(currentUserId)
                                      ? "bg-green-500"
                                      : "bg-orange-500"
                                  }`}
                                ></div> */}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                  {currentUser?.name}
                                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">
                                    You
                                  </span>
                                  {currentUser?._id === roomOwner?._id && (
                                    <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium">
                                      <Crown className="h-3 w-3" />
                                      Owner
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                                  {currentUser?.isSpectator
                                    ? "Spectator"
                                    : "Participant"}
                                  {currentUser?.isSpectator && (
                                    <Eye className="h-3 w-3" />
                                  )}
                                  {/* <span
                                    className={`text-xs px-1.5 py-0.5 rounded-full text-white ${
                                      isUserActive(currentUserId)
                                        ? "bg-green-500"
                                        : "bg-orange-500"
                                    }`}
                                  >
                                    {isUserActive(currentUserId)
                                      ? "Active"
                                      : "Offline"}
                                  </span> */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Other Users */}
                        {otherUsers.map((user) => (
                          <div
                            key={user._id}
                            className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-3 md:p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  {/* <div
                                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                                      isUserActive(user._id)
                                        ? "bg-green-500"
                                        : "bg-orange-500"
                                    }`}
                                  ></div> */}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                    {user.name}
                                    {user._id === roomOwner?._id && (
                                      <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium">
                                        <Crown className="h-3 w-3" />
                                        Owner
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                                    {user.isSpectator
                                      ? "Spectator"
                                      : "Participant"}
                                    {user.isSpectator && (
                                      <Eye className="h-3 w-3" />
                                    )}
                                    {/* <span
                                      className={`text-xs px-1.5 py-0.5 rounded-full text-white ${
                                        isUserActive(user._id)
                                          ? "bg-green-500"
                                          : "bg-orange-500"
                                      }`}
                                    >
                                      {isUserActive(user._id)
                                        ? "Active"
                                        : "Offline"}
                                    </span> */}
                                  </div>
                                </div>
                              </div>

                              {/* Actions for room owner */}
                              {isOwner && user._id !== roomOwner?._id && (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUserForOwnership(user);
                                      setOwnershipDialogOpen(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 text-xs"
                                  >
                                    <Crown className="h-3 w-3 mr-1 sm:mr-2" />
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
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs"
                                  >
                                    <UserMinus className="h-3 w-3 mr-1 sm:mr-2" />
                                    Kick
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {otherUsers.length === 0 && (
                          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                              No other members
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Share the room link to invite others to join
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-red-600" />
              Kick User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to kick{" "}
              <strong>{selectedUserForKick?.name}</strong> from the room? This
              action cannot be undone and they will need to rejoin using the
              room link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleKick}
              className="bg-red-600 hover:bg-red-700"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Kick User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Ownership Confirmation Dialog */}
      <AlertDialog
        open={ownershipDialogOpen}
        onOpenChange={setOwnershipDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Transfer Ownership
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to make{" "}
              <strong>{selectedUserForOwnership?.name}</strong> the new room
              owner? You will lose your owner privileges and they will be able
              to manage the room settings and members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransferOwnership}
              className="bg-blue-600 hover:bg-blue-700"
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
