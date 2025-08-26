import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../store';

export function useSocket() {
  const { user, token } = useAppSelector(s => s.auth);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !token) return;

    // Create socket connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: token,
        cafeId: user.cafeId || 'system',
        userId: user._id,
        role: user.role
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user?.cafeId, token, user?._id, user?.role]);

  // Return socket instance and connection status
  return socketRef.current;
}

// Hook for real-time order updates
export function useOrderSocket(cafeId: string) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !cafeId) return;

    // Join cafe room for order updates
    socket.emit('join:cafe', { cafeId });

    return () => {
      socket.emit('leave:cafe', { cafeId });
    };
  }, [socket, cafeId]);

  return socket;
}

// Hook for real-time table updates
export function useTableSocket(cafeId: string) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !cafeId) return;

    // Join table room for updates
    socket.emit('join:tables', { cafeId });

    return () => {
      socket.emit('leave:tables', { cafeId });
    };
  }, [socket, cafeId]);

  return socket;
}
