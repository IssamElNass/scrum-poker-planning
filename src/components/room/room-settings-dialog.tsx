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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import type { RoomWithRelatedData } from "@/convex/model/rooms";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import {
  Calendar,
  Crown,
  Eye,
  Github,
  Hash,
  Lock,
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

type SettingsTab = "general" | "members" | "integrations";

export function RoomSettingsDialog({
  isOpen,
  onOpenChange,
  roomData,
  currentUserId,
}: RoomSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [roomName, setRoomName] = useState(roomData.room.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [selectedIntegrationType, setSelectedIntegrationType] = useState<
    "github" | "jira"
  >("github");

  // User management state
  const [kickDialogOpen, setKickDialogOpen] = useState(false);
  const [ownershipDialogOpen, setOwnershipDialogOpen] = useState(false);
  const [selectedUserForKick, setSelectedUserForKick] =
    useState<Doc<"users"> | null>(null);
  const [selectedUserForOwnership, setSelectedUserForOwnership] =
    useState<Doc<"users"> | null>(null);

  const { toast } = useToast();
  const updateRoomName = useMutation(api.rooms.updateName);
  const updateRoomPassword = useMutation(api.rooms.updatePassword);
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

  const handleUpdatePassword = async () => {
    if (!password.trim() && !roomData.room.password) {
      toast({
        title: "No changes",
        description: "Password field is empty",
        variant: "default",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateRoomPassword({
        roomId: roomData.room._id,
        userId: currentUserId,
        password: password.trim() || undefined,
      });

      toast({
        title: password.trim() ? "Password updated" : "Password removed",
        description: password.trim()
          ? "Room password has been updated successfully"
          : "Room password has been removed successfully",
      });
      setPassword("");
      setShowPasswordSection(false);
    } catch (error) {
      console.error("Failed to update password:", error);
      toast({
        title: "Failed to update password",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemovePassword = async () => {
    setIsUpdating(true);
    try {
      await updateRoomPassword({
        roomId: roomData.room._id,
        userId: currentUserId,
        password: undefined,
      });

      toast({
        title: "Password removed",
        description: "Room password has been removed successfully",
      });
      setPassword("");
      setShowPasswordSection(false);
    } catch (error) {
      console.error("Failed to remove password:", error);
      toast({
        title: "Failed to remove password",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setRoomName(roomData.room.name);
      setActiveTab("general");
      setPassword("");
      setShowPasswordSection(false);
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
    {
      id: "integrations" as const,
      label: "Integrations",
      icon: Github,
      description: "Connect external tools",
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
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:w-[800px] sm:max-w-[60vw] p-0 gap-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
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

          <SheetHeader className="relative px-6 py-5 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-slate-50/80 via-blue-50/80 to-purple-50/80 dark:from-gray-950/80 dark:via-blue-950/80 dark:to-purple-950/80 backdrop-blur-sm">
            <SheetTitle className="flex flex-col gap-3">
              {/* Branding badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 px-3 py-1.5 ring-1 ring-primary/20 w-fit">
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
            </SheetTitle>
          </SheetHeader>

          <div className="relative flex h-[calc(100vh-140px)] min-h-0 flex-row">
            {/* Sidebar Navigation */}
            <div className="w-56 border-r border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-b from-white/80 via-slate-50/80 to-blue-50/80 dark:from-gray-950/80 dark:via-gray-900/80 dark:to-blue-950/80 backdrop-blur-sm overflow-y-auto">
              <div className="relative p-4 space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`group w-full flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all duration-300 relative overflow-hidden ${
                      activeTab === item.id
                        ? "bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary border-2 border-primary/20 shadow-lg shadow-primary/10"
                        : "hover:bg-white/70 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg transition-all duration-300 ${
                        activeTab === item.id
                          ? "bg-gradient-to-br from-primary/20 to-purple-500/20 ring-1 ring-primary/30"
                          : "bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 transition-colors duration-300 ${
                          activeTab === item.id
                            ? "text-primary"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="w-full">
                      <div
                        className={`font-semibold text-sm transition-colors duration-300 ${
                          activeTab === item.id ? "text-primary" : ""
                        }`}
                      >
                        {item.label}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="relative flex-1 overflow-y-auto bg-gradient-to-br from-white/50 via-slate-50/50 to-blue-50/50 dark:from-gray-950/50 dark:via-gray-900/50 dark:to-blue-950/50">
              <div className="p-6">
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

                        {/* Password Management */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg">
                                <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                  Password Protection
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {roomData.room.password
                                    ? "This room is password protected"
                                    : "Add a password to restrict access"}
                                </p>
                              </div>
                            </div>
                            {!showPasswordSection && (
                              <Button
                                onClick={() => setShowPasswordSection(true)}
                                variant="outline"
                                className="rounded-xl"
                              >
                                {roomData.room.password
                                  ? "Change Password"
                                  : "Set Password"}
                              </Button>
                            )}
                          </div>

                          {showPasswordSection && (
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-800/50 space-y-4">
                              <div className="space-y-3">
                                <Label
                                  htmlFor="room-password"
                                  className="text-base font-semibold text-gray-900 dark:text-gray-100"
                                >
                                  {roomData.room.password
                                    ? "New Password"
                                    : "Password"}
                                </Label>
                                <Input
                                  id="room-password"
                                  type="password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="Enter password"
                                  disabled={isUpdating}
                                  className="h-12 text-base rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {roomData.room.password
                                    ? "Leave empty to remove password protection"
                                    : "Users will need this password to join the room"}
                                </p>
                              </div>

                              <div className="flex gap-3">
                                <Button
                                  onClick={handleUpdatePassword}
                                  disabled={isUpdating}
                                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-600/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-600/40"
                                >
                                  {isUpdating ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      Updating...
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <Save className="h-4 w-4" />
                                      {password.trim()
                                        ? "Update Password"
                                        : "Remove Password"}
                                    </div>
                                  )}
                                </Button>
                                {roomData.room.password && (
                                  <Button
                                    onClick={handleRemovePassword}
                                    disabled={isUpdating}
                                    variant="outline"
                                    className="h-12 rounded-xl border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                  >
                                    Remove
                                  </Button>
                                )}
                                <Button
                                  onClick={() => {
                                    setShowPasswordSection(false);
                                    setPassword("");
                                  }}
                                  disabled={isUpdating}
                                  variant="outline"
                                  className="h-12 rounded-xl"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
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

                {activeTab === "integrations" && (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl ring-1 ring-indigo-500/30">
                          <Github className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Integrations
                          </h3>
                          <p className="text-base text-gray-600 dark:text-gray-400">
                            Connect external project management tools
                          </p>
                        </div>
                      </div>

                      {/* Integration Type Selector */}
                      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6 shadow-lg shadow-gray-200/20 dark:shadow-gray-900/20">
                        <Label className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 block">
                          Integration Type
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setSelectedIntegrationType("github")}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                              selectedIntegrationType === "github"
                                ? "border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 ring-2 ring-purple-500/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  selectedIntegrationType === "github"
                                    ? "bg-purple-500/20"
                                    : "bg-gray-100 dark:bg-gray-800"
                                }`}
                              >
                                <Github
                                  className={`h-5 w-5 ${
                                    selectedIntegrationType === "github"
                                      ? "text-purple-600 dark:text-purple-400"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                />
                              </div>
                              <div className="text-left">
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                  GitHub
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  Import issues & export estimates
                                </div>
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => setSelectedIntegrationType("jira")}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                              selectedIntegrationType === "jira"
                                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 ring-2 ring-blue-500/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  selectedIntegrationType === "jira"
                                    ? "bg-blue-500/20"
                                    : "bg-gray-100 dark:bg-gray-800"
                                }`}
                              >
                                <svg
                                  className={`h-5 w-5 ${
                                    selectedIntegrationType === "jira"
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 2.058V1.005A1.005 1.005 0 0 0 23.013 0z" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                  Jira
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  Import issues & export story points
                                </div>
                              </div>
                            </div>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                          Note: Only one integration can be active per room. To
                          switch, disconnect the current integration first.
                        </p>
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
        </SheetContent>
      </Sheet>

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
