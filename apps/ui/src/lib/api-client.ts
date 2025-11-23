/**
 * API Client for communicating with the Backend service
 * Replaces Server Actions with REST API calls
 */

import axios, { AxiosError } from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response wrapper type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Error handler
function handleApiError(error: unknown): ApiResponse {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || axiosError.message || 'An error occurred',
    };
  }
  return {
    success: false,
    error: error instanceof Error ? error.message : 'An unknown error occurred',
  };
}

// ===== ROOMS API =====

export async function createRoom(data: {
  name: string;
  votingCategorized?: boolean;
  autoCompleteVoting?: boolean;
  roomType?: string;
  votingSystem?: string;
  password?: string;
}): Promise<ApiResponse> {
  try {
    const response = await apiClient.post('/api/rooms', data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getRoomData(roomId: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.get(`/api/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateRoomSettings(
  roomId: string,
  settings: {
    name?: string;
    votingCategorized?: boolean;
    autoCompleteVoting?: boolean;
    votingSystem?: string;
    password?: string;
  }
): Promise<ApiResponse> {
  try {
    const response = await apiClient.patch(`/api/rooms/${roomId}/settings`, settings);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateGameState(roomId: string, isGameOver: boolean): Promise<ApiResponse> {
  try {
    const response = await apiClient.patch(`/api/rooms/${roomId}/game-state`, { isGameOver });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function setActiveStory(roomId: string, storyNodeId: string | null): Promise<ApiResponse> {
  try {
    const response = await apiClient.patch(`/api/rooms/${roomId}/active-story`, { storyNodeId });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteRoom(roomId: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.delete(`/api/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function verifyRoomPassword(roomId: string, password: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.post(`/api/rooms/${roomId}/verify-password`, { password });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// ===== VOTES API =====

export async function castVote(
  roomId: string,
  userId: string,
  cardData: {
    cardLabel?: string;
    cardValue?: number;
    cardIcon?: string;
  }
): Promise<ApiResponse> {
  try {
    const response = await apiClient.post('/api/votes', {
      roomId,
      userId,
      ...cardData,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function clearVotes(roomId: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.delete(`/api/votes/${roomId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function revealVotes(roomId: string, revealed: boolean): Promise<ApiResponse> {
  try {
    const response = await apiClient.post(`/api/votes/${roomId}/reveal`, { revealed });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function removeVote(roomId: string, userId: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.delete(`/api/votes/${roomId}/user/${userId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// ===== USERS API =====

export async function joinRoom(
  roomId: string,
  name: string,
  isSpectator: boolean = false
): Promise<ApiResponse> {
  try {
    const response = await apiClient.post('/api/users/join', {
      roomId,
      name,
      isSpectator,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function leaveRoom(roomId: string, userId: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.post('/api/users/leave', {
      roomId,
      userId,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function kickUser(roomId: string, userId: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.post(`/api/users/${userId}/kick`, { roomId });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateUserRole(userId: string, isSpectator: boolean): Promise<ApiResponse> {
  try {
    const response = await apiClient.patch(`/api/users/${userId}/role`, { isSpectator });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateUserName(userId: string, name: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.patch(`/api/users/${userId}/name`, { name });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function sendReaction(
  roomId: string,
  userId: string,
  reactionType: string
): Promise<ApiResponse> {
  try {
    const response = await apiClient.post(`/api/users/${userId}/reaction`, {
      roomId,
      reactionType,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// ===== CANVAS API =====

export async function getCanvasNodes(roomId: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.get(`/api/canvas/${roomId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createOrUpdateCanvasNode(
  roomId: string,
  nodeId: string,
  type: string,
  position: { x: number; y: number },
  data?: Record<string, unknown>,
  lastUpdatedBy?: string
): Promise<ApiResponse> {
  try {
    const response = await apiClient.post(`/api/canvas/${roomId}/nodes`, {
      nodeId,
      type,
      position,
      data,
      lastUpdatedBy,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateCanvasNode(
  roomId: string,
  nodeId: string,
  updates: {
    position?: { x: number; y: number };
    data?: Record<string, unknown>;
    isLocked?: boolean;
    lastUpdatedBy?: string;
  }
): Promise<ApiResponse> {
  try {
    const response = await apiClient.patch(`/api/canvas/${roomId}/nodes/${nodeId}`, updates);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteCanvasNode(roomId: string, nodeId: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.delete(`/api/canvas/${roomId}/nodes/${nodeId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// ===== TIMER API =====

export async function startTimer(roomId: string, duration: number): Promise<ApiResponse> {
  try {
    const response = await apiClient.post(`/api/timer/${roomId}/start`, { duration });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function pauseTimer(roomId: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.post(`/api/timer/${roomId}/pause`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function resumeTimer(roomId: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.post(`/api/timer/${roomId}/resume`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function resetTimer(roomId: string, duration?: number): Promise<ApiResponse> {
  try {
    const response = await apiClient.post(`/api/timer/${roomId}/reset`, { duration });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// ===== INTEGRATIONS API =====

export async function createIntegration(
  roomId: string,
  type: string,
  credentials: Record<string, unknown>,
  config?: Record<string, unknown>
): Promise<ApiResponse> {
  try {
    const response = await apiClient.post('/api/integrations', {
      roomId,
      type,
      credentials,
      config,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateIntegration(
  integrationId: string,
  credentials?: Record<string, unknown>,
  config?: Record<string, unknown>
): Promise<ApiResponse> {
  try {
    const response = await apiClient.patch(`/api/integrations/${integrationId}`, {
      credentials,
      config,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteIntegration(integrationId: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.delete(`/api/integrations/${integrationId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

