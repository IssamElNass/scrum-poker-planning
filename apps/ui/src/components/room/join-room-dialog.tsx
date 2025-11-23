"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import * as apiClient from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { Id, RoomWithRelatedData, VotingSystem } from "@/lib/types";
import {
  DEFAULT_VOTING_SYSTEM,
  VOTING_SYSTEMS,
  VotingSystemType,
} from "@/lib/voting-systems";
import { ChevronDown, Lock } from "lucide-react";
import { useState } from "react";

interface JoinRoomDialogProps {
  roomId: Id<"rooms">;
  roomName: string;
  roomData: RoomWithRelatedData;
}

export function JoinRoomDialog({
  roomId,
  roomName,
  roomData,
}: JoinRoomDialogProps) {
  const { setUser } = useAuth();

  const [userName, setUserName] = useState("");
  const [isSpectator, setIsSpectator] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedVotingSystem, setSelectedVotingSystem] =
    useState<VotingSystemType>(
      roomData.room.votingSystem || DEFAULT_VOTING_SYSTEM
    );

  // Check if this user will be the first to join (and thus become the room owner)
  const isFirstUser = roomData.users.length === 0;
  const roomHasPassword = !!roomData.room.password;

  const handleJoin = async () => {
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    // Validate password for non-first users if room has password
    if (!isFirstUser && roomHasPassword && !password) {
      toast.error("Password is required to join this room");
      return;
    }

    setIsJoining(true);
    try {
      // TODO: Verify password if room has one
      // This should be done server-side via an action

      const result = await apiClient.joinRoom(roomId, userName, isSpectator);

      if (!result.success || !result.data) {
        toast.error(result.error || "Failed to join room");
        return;
      }

      // If this is the first user and they selected a different voting system, update it
      if (isFirstUser && selectedVotingSystem !== roomData.room.votingSystem) {
        try {
          await apiClient.updateRoomSettings(roomId, {
            votingSystem: selectedVotingSystem as VotingSystem,
          });
        } catch (error) {
          console.error("Failed to update voting system:", error);
          // Don't block joining for this error
        }
      }

      setUser({
        id: result.data.id,
        name: userName,
        roomId,
      });

      // Page will automatically re-render and show the room
    } catch (error) {
      let errorMessage = "Failed to join room";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-[10%] w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(99 102 241 / 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(99 102 241 / 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>
      </div>

      <div className="relative max-w-md w-full">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl ring-1 ring-gray-200/50 dark:ring-gray-800/50 border-0">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-2 ring-1 ring-primary/20 mb-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-primary">
                Scrum Poker Planning
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
              {isFirstUser
                ? "Set Up Planning Session"
                : "Join Planning Session"}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
              {roomName}
            </p>
          </div>

          <div className="space-y-6">
            {/* Name input */}
            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-base font-semibold text-gray-900 dark:text-white"
              >
                Your Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your name to join"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (!roomHasPassword || password))
                    handleJoin();
                }}
                className="h-12 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary text-base"
              />
            </div>

            {/* Password input */}
            {(isFirstUser || roomHasPassword) && (
              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {isFirstUser ? "Password (Optional)" : "Password"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={
                    isFirstUser
                      ? "Set a password to protect this room"
                      : "Enter room password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleJoin();
                  }}
                  className="h-12 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary text-base"
                />
                {isFirstUser && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Set a password to restrict access to this planning session
                  </p>
                )}
              </div>
            )}

            {/* Spectator toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <div>
                  <Label
                    htmlFor="spectator"
                    className="text-base font-semibold text-gray-900 dark:text-white cursor-pointer"
                  >
                    Observer Mode
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Watch without voting
                  </p>
                </div>
              </div>
              <Switch
                id="spectator"
                checked={isSpectator}
                onCheckedChange={setIsSpectator}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* Voting System Selection (only for first user) */}
            {isFirstUser && (
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900 dark:text-white">
                  Voting System
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl border-gray-300 dark:border-gray-600 justify-between text-left font-normal"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {VOTING_SYSTEMS[selectedVotingSystem].cards
                            .slice(0, 4)
                            .map((card, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                              >
                                {card}
                              </span>
                            ))}
                          {VOTING_SYSTEMS[selectedVotingSystem].cards.length >
                            4 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                              +
                              {VOTING_SYSTEMS[selectedVotingSystem].cards
                                .length - 4}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">
                          {VOTING_SYSTEMS[selectedVotingSystem].name}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="start">
                    {Object.values(VOTING_SYSTEMS).map((system) => (
                      <DropdownMenuItem
                        key={system.id}
                        onClick={() => setSelectedVotingSystem(system.id)}
                        className={`p-4 cursor-pointer ${
                          selectedVotingSystem === system.id
                            ? "bg-primary/5"
                            : ""
                        }`}
                      >
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{system.name}</span>
                            {selectedVotingSystem === system.id && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {system.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {system.cards.slice(0, 8).map((card, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                              >
                                {card}
                              </span>
                            ))}
                            {system.cards.length > 8 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                +{system.cards.length - 8} more
                              </span>
                            )}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Join button */}
            <Button
              onClick={handleJoin}
              disabled={!userName.trim() || isJoining}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold text-base shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isJoining ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isFirstUser ? "Setting up..." : "Joining..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isSpectator
                    ? "Join as Observer"
                    : isFirstUser
                    ? "Create Planning Session"
                    : "Join Planning Session"}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              )}
            </Button>

            {/* Help text */}
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isSpectator
                  ? "You'll be able to see the voting process but won't participate in estimation"
                  : isFirstUser
                  ? "As the session creator, you can choose the voting system for your team"
                  : "You'll be able to vote on story point estimates with your team"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
