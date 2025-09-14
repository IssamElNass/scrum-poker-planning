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

  const isOwner = useQuery(api.rooms.isOwner, {
    roomId: roomData.room._id,
    userId: currentUserId,
  });

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

      toast({
        title: "Ownership transferred",
        description: `${selectedUserForOwnership.name} is now the room owner`,
      });
      setOwnershipDialogOpen(false);
      setSelectedUserForOwnership(null);
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

  const handleRoomNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveRoomName();
    }
    if (e.key === "Escape") {
      setRoomName(roomData.room.name);
    }
  };

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setRoomName(roomData.room.name);
      setActiveTab("general");
    }
  }, [isOpen, roomData.room.name]);

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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-none w-[95vw] min-w-[1400px] h-[90vh] p-0 gap-0">
          <DialogHeader className="px-6 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
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

          <div className="flex h-full min-h-0">
            {/* Sidebar */}
            <div className="w-72 border-r bg-gradient-to-b from-gray-50/80 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/30">
              <div className="p-6 space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 ${
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
              <div className="p-8">
                {activeTab === "general" && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                          <Settings className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            General Settings
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Configure basic room properties
                          </p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
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
                              onKeyDown={handleRoomNameKeyDown}
                              onBlur={handleSaveRoomName}
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "members" && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Room Members
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage users and permissions
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Current User */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-lg">
                                  {currentUser?.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
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
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Other Users */}
                        {otherUsers.map((user) => (
                          <div
                            key={user._id}
                            className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
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
                                  </div>
                                </div>
                              </div>

                              {/* Actions for room owner */}
                              {isOwner && user._id !== roomOwner?._id && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUserForOwnership(user);
                                      setOwnershipDialogOpen(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                  >
                                    <Crown className="h-3 w-3 mr-2" />
                                    Make Owner
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUserForKick(user);
                                      setKickDialogOpen(true);
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                  >
                                    <UserMinus className="h-3 w-3 mr-2" />
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

                      {/* Room Statistics */}
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                {roomData.users.length}
                              </div>
                              <div className="text-sm text-emerald-600 dark:text-emerald-400">
                                Total Members
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                {
                                  roomData.users.filter((u) => !u.isSpectator)
                                    .length
                                }
                              </div>
                              <div className="text-sm text-blue-600 dark:text-blue-400">
                                Participants
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                {
                                  roomData.users.filter((u) => u.isSpectator)
                                    .length
                                }
                              </div>
                              <div className="text-sm text-purple-600 dark:text-purple-400">
                                Spectators
                              </div>
                            </div>
                          </div>
                        </div>
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
