'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
});

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    // Don't create multiple connections
    if (socket) {
      console.log('Socket already exists, reusing connection');
      return;
    }

    const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:5000';
    console.log('Initializing Socket.io connection to:', WEBSOCKET_URL);
    
    const socketInstance = io(WEBSOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Socket.io connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Socket.io reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('Socket.io reconnection error:', error);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('Socket.io reconnection failed');
    });

    setSocket(socketInstance);
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      console.log('Disconnecting socket...');
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Hook to join a room and handle cleanup
 * This will automatically connect the socket when called
 */
export function useRoomSocket(roomId: string | null) {
  const { socket, isConnected, connect, disconnect } = useSocket();
  const [isJoined, setIsJoined] = useState(false);

  // Connect socket when entering a room
  useEffect(() => {
    if (!roomId) return;

    // Initialize socket connection if not already connected
    connect();
  }, [roomId, connect]);

  // Join the specific room once socket is connected
  useEffect(() => {
    if (!socket || !isConnected || !roomId) {
      setIsJoined(false);
      return;
    }

    // Join room
    socket.emit('join-room', roomId);
    setIsJoined(true);
    console.log('Joined room:', roomId);

    // Cleanup - leave room on unmount
    return () => {
      socket.emit('leave-room', roomId);
      setIsJoined(false);
      console.log('Left room:', roomId);
    };
  }, [socket, isConnected, roomId]);

  // Disconnect socket when leaving room page
  useEffect(() => {
    return () => {
      if (roomId) {
        console.log('Leaving room page, disconnecting socket...');
        disconnect();
      }
    };
  }, [roomId, disconnect]);

  return { socket, isConnected, isJoined };
}

/**
 * Hook to listen for specific socket events
 */
export function useSocketEvent<T = unknown>(
  event: string,
  handler: (data: T) => void
) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, isConnected, event, handler]);
}

/**
 * Hook to emit socket events
 */
export function useSocketEmit() {
  const { socket, isConnected } = useSocket();

  const emit = (event: string, data: unknown) => {
    if (!socket || !isConnected) {
      console.warn('Cannot emit event: socket not connected');
      return;
    }

    socket.emit(event, data);
  };

  return { emit, isConnected };
}
