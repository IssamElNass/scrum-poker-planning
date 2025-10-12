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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import type { RoomWithRelatedData } from "@/convex/model/rooms";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import {
  Crown,
  Eye,
  Github,
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
      label: "Integrations (Soon)",
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
          className="w-full sm:w-[800px] sm:max-w-[60vw] p-0 gap-0"
        >
          <SheetHeader className="px-6 py-5 border-b">
            <SheetTitle className="flex items-center gap-3">
              <Settings className="h-5 w-5" />
              Room Settings
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as SettingsTab)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  {sidebarItems.map((item) => (
                    <TabsTrigger
                      key={item.id}
                      value={item.id}
                      className="flex items-center gap-2"
                      disabled={item.id === "integrations"}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="general" className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      General Settings
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Configure your planning session properties
                    </p>

                    <div className="bg-card border rounded-lg p-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="room-name"
                            className="text-base font-semibold"
                          >
                            Session Name
                          </Label>
                          {!isOwner && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
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
                            className="flex-1"
                          />
                          {roomName !== roomData.room.name && (
                            <Button
                              onClick={handleSaveRoomName}
                              disabled={!isOwner || isUpdating}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {isUpdating ? "Saving..." : "Save"}
                            </Button>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Password Management */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <h4 className="font-semibold text-lg">
                                Password Protection
                              </h4>
                              <p className="text-sm text-muted-foreground">
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
                            >
                              {roomData.room.password
                                ? "Change Password"
                                : "Set Password"}
                            </Button>
                          )}
                        </div>

                        {showPasswordSection && (
                          <div className="bg-muted/50 rounded-lg p-4 space-y-4 border">
                            <div className="space-y-3">
                              <Label
                                htmlFor="room-password"
                                className="text-base font-semibold"
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
                              />
                              <p className="text-sm text-muted-foreground">
                                {roomData.room.password
                                  ? "Leave empty to remove password protection"
                                  : "Users will need this password to join the room"}
                              </p>
                            </div>

                            <div className="flex gap-3">
                              <Button
                                onClick={handleUpdatePassword}
                                disabled={isUpdating}
                                className="flex-1"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                {isUpdating
                                  ? "Updating..."
                                  : password.trim()
                                    ? "Update Password"
                                    : "Remove Password"}
                              </Button>
                              {roomData.room.password && (
                                <Button
                                  onClick={handleRemovePassword}
                                  disabled={isUpdating}
                                  variant="outline"
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
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-6">
                        <div className="space-y-6">
                          <h4 className="font-semibold flex items-center gap-3 text-lg">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            Session Statistics
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-muted/50 rounded-lg p-4 border">
                              <div className="flex items-center gap-4">
                                <Users className="h-6 w-6 text-muted-foreground" />
                                <div>
                                  <div className="text-3xl font-bold">
                                    {roomData.users.length}
                                  </div>
                                  <div className="text-sm font-medium text-muted-foreground">
                                    Total Members
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-4 border">
                              <div className="flex items-center gap-4">
                                <Users className="h-6 w-6 text-muted-foreground" />
                                <div>
                                  <div className="text-3xl font-bold">
                                    {
                                      roomData.users.filter(
                                        (u) => !u.isSpectator
                                      ).length
                                    }
                                  </div>
                                  <div className="text-sm font-medium text-muted-foreground">
                                    Participants
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-4 border">
                              <div className="flex items-center gap-4">
                                <Eye className="h-6 w-6 text-muted-foreground" />
                                <div>
                                  <div className="text-3xl font-bold">
                                    {
                                      roomData.users.filter(
                                        (u) => u.isSpectator
                                      ).length
                                    }
                                  </div>
                                  <div className="text-sm font-medium text-muted-foreground">
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
                </TabsContent>

                <TabsContent value="integrations" className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Integrations</h3>
                    <p className="text-muted-foreground mb-6">
                      Connect external project management tools
                    </p>

                    {/* Integration Type Selector */}
                    <div className="bg-card border rounded-lg p-6">
                      <Label className="text-base font-semibold mb-4 block">
                        Integration Type
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant={
                            selectedIntegrationType === "github"
                              ? "secondary"
                              : "outline"
                          }
                          onClick={() => setSelectedIntegrationType("github")}
                          className="h-auto p-4 justify-start"
                        >
                          <div className="flex items-center gap-3">
                            <Github className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-semibold">GitHub</div>
                              <div className="text-xs text-muted-foreground">
                                Import issues & export estimates
                              </div>
                            </div>
                          </div>
                        </Button>

                        <Button
                          variant={
                            selectedIntegrationType === "jira"
                              ? "secondary"
                              : "outline"
                          }
                          onClick={() => setSelectedIntegrationType("jira")}
                          className="h-auto p-4 justify-start"
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 2.058V1.005A1.005 1.005 0 0 0 23.013 0z" />
                            </svg>
                            <div className="text-left">
                              <div className="font-semibold">Jira</div>
                              <div className="text-xs text-muted-foreground">
                                Import issues & export story points
                              </div>
                            </div>
                          </div>
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Note: Only one integration can be active per room. To
                        switch, disconnect the current integration first.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="members" className="space-y-6">
                  <div className="h-full">
                    <h3 className="text-2xl font-bold mb-2">Session Members</h3>
                    <p className="text-muted-foreground mb-6">
                      Manage participants and observers
                    </p>

                    <div className="space-y-4 max-h-full overflow-y-auto">
                      {/* Current User */}
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-lg font-bold">
                              {currentUser?.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold flex items-center gap-3 text-lg">
                                {currentUser?.name}
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-semibold">
                                  You
                                </span>
                                {currentUser?._id === roomOwner?._id && (
                                  <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-semibold">
                                    <Crown className="h-3.5 w-3.5" />
                                    Owner
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                    currentUser?.isSpectator
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-green-100 text-green-700"
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
                          className="group bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-foreground text-lg font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold flex items-center gap-3 text-lg">
                                  {user.name}
                                  {user._id === roomOwner?._id && (
                                    <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-semibold">
                                      <Crown className="h-3.5 w-3.5" />
                                      Owner
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                      user.isSpectator
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-green-100 text-green-700"
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
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUserForOwnership(user);
                                    setOwnershipDialogOpen(true);
                                  }}
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
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
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
                        <div className="text-center py-16 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h4 className="font-semibold mb-3 text-lg">
                            No other members yet
                          </h4>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            Share the session link to invite your team members
                            and start collaborative planning
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Kick Confirmation Dialog */}
      <AlertDialog open={kickDialogOpen} onOpenChange={setKickDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <UserMinus className="h-5 w-5 text-destructive" />
              Remove Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold">{selectedUserForKick?.name}</span>{" "}
              from this planning session? This action cannot be undone and they
              will need to rejoin using the session link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleKick}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-amber-600" />
              Transfer Ownership
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to make{" "}
              <span className="font-semibold">
                {selectedUserForOwnership?.name}
              </span>{" "}
              the new session owner? You will lose your owner privileges and
              they will be able to manage the session settings and members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTransferOwnership}>
              <Crown className="h-4 w-4 mr-2" />
              Transfer Ownership
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
