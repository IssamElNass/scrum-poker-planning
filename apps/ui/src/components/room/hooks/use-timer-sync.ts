"use client";

import { useSocketEvent } from "@/components/socket-provider";
import * as apiClient from "@/lib/api-client";
import { Id } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseTimerSyncProps {
  roomId: Id<"rooms">;
  nodeId: string;
  userId?: Id<"users">;
}

interface TimerState {
  isRunning: boolean;
  currentSeconds: number;
  startedAt?: number;
  pausedAt?: number;
}

interface UseTimerSyncReturn {
  // Timer state
  currentSeconds: number;
  isRunning: boolean;
  displayTime: string;

  // Control functions
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

export function useTimerSync({
  roomId,
  nodeId,
  userId,
}: UseTimerSyncProps): UseTimerSyncReturn {
  // Local state for smooth timer display
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    currentSeconds: 0,
  });
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch initial timer state
  useEffect(() => {
    const fetchTimerState = async () => {
      try {
        const BACKEND_URL =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const response = await fetch(`${BACKEND_URL}/api/timer/${roomId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setTimerState(result.data);
            setLastSyncTime(Date.now());
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch timer state:", err);
        setError("Failed to load timer");
        setIsLoading(false);
      }
    };

    fetchTimerState();
  }, [roomId, nodeId]);

  // Listen for timer updates via Socket.io
  const handleTimerUpdate = useCallback((data: TimerState) => {
    setTimerState(data);
    setLastSyncTime(Date.now());
    setError(null);
  }, []);

  useSocketEvent("timer-update", handleTimerUpdate);

  // Handle local timer ticking for smooth display
  useEffect(() => {
    if (timerState.isRunning) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSinceSync = (now - lastSyncTime) / 1000;
        setTimerState((prev) => ({
          ...prev,
          currentSeconds: (prev.currentSeconds || 0) + elapsedSinceSync,
        }));
        setLastSyncTime(now);
      }, 100); // Update more frequently for smooth display
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, lastSyncTime]);

  // Format time display
  const formatTime = useCallback((totalSeconds: number): string => {
    const seconds = Math.floor(totalSeconds);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Control functions
  const onStart = useCallback(async () => {
    if (!userId) {
      setError("User ID required to control timer");
      return;
    }

    try {
      setError(null);
      await apiClient.startTimer(roomId, 300); // Default 5 minutes
    } catch (err) {
      console.error("Failed to start timer:", err);
      setError("Failed to start timer");
    }
  }, [roomId, userId]);

  const onPause = useCallback(async () => {
    if (!userId) {
      setError("User ID required to control timer");
      return;
    }

    try {
      setError(null);
      await apiClient.pauseTimer(roomId);
    } catch (err) {
      console.error("Failed to pause timer:", err);
      setError("Failed to pause timer");
    }
  }, [roomId, userId]);

  const onReset = useCallback(async () => {
    if (!userId) {
      setError("User ID required to control timer");
      return;
    }

    try {
      setError(null);
      await apiClient.resetTimer(roomId);
    } catch (err) {
      console.error("Failed to reset timer:", err);
      setError("Failed to reset timer");
    }
  }, [roomId, userId]);

  // Calculate current display values
  const currentSeconds = Math.floor(timerState.currentSeconds || 0);
  const isRunning = timerState.isRunning;
  const displayTime = formatTime(timerState.currentSeconds || 0);

  return {
    currentSeconds,
    isRunning,
    displayTime,
    onStart,
    onPause,
    onReset,
    isLoading,
    error,
  };
}
