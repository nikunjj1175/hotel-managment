import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket {
  userId: string;
  cafeId: string;
  role: string;
}

export function setupSocketIO(httpServer: HTTPServer) {
  // Temporarily return a mock socket server to avoid mongoose issues
  // TODO: Fix mongoose types and re-enable full functionality
  console.log('Socket.IO server setup - using mock implementation');
  
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware - simplified for now
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // For now, accept any valid JWT token
      // TODO: Add proper user verification when mongoose is fixed
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      socket.data.user = {
        userId: decoded.userId || 'mock-user',
        cafeId: decoded.cafeId || 'default-cafe',
        role: decoded.role || 'CUSTOMER'
      };

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as AuthenticatedSocket;
    console.log(`User ${user.userId} (${user.role}) connected`);

    // Join role-specific rooms
    if (user.role === 'SUPER_ADMIN') {
      socket.join('super_admin');
    } else if (user.cafeId) {
      socket.join(`cafe:${user.cafeId}`);
      
      if (user.role === 'CAFE_ADMIN') {
        socket.join(`cafe_admin:${user.cafeId}`);
      } else if (user.role === 'KITCHEN') {
        socket.join(`kitchen:${user.cafeId}`);
      } else if (user.role === 'WAITER') {
        socket.join(`waiter:${user.cafeId}`);
      } else if (user.role === 'MANAGER') {
        socket.join(`manager:${user.cafeId}`);
      }
    }

    // Handle customer-specific room joining
    socket.on('join:customer', (data) => {
      if (user.cafeId && data.cafeId === user.cafeId) {
        socket.join(`customer:${user.cafeId}:${user.userId}`);
      }
    });

    // Handle kitchen room joining
    socket.on('join:kitchen', (data) => {
      if (user.cafeId && data.cafeId === user.cafeId && user.role === 'KITCHEN') {
        socket.join(`kitchen:${user.cafeId}`);
      }
    });

    // Handle waiter room joining
    socket.on('join:waiter', (data) => {
      if (user.cafeId && data.cafeId === user.cafeId && user.role === 'WAITER') {
        socket.join(`waiter:${user.cafeId}`);
      }
    });

    // Handle manager room joining
    socket.on('join:manager', (data) => {
      if (user.cafeId && data.cafeId === user.cafeId && user.role === 'MANAGER') {
        socket.join(`manager:${user.cafeId}`);
      }
    });

    // Handle cafe admin room joining
    socket.on('join:cafe_admin', (data) => {
      if (user.cafeId && data.cafeId === user.cafeId && user.role === 'CAFE_ADMIN') {
        socket.join(`cafe_admin:${user.cafeId}`);
      }
    });

    // Handle super admin room joining
    socket.on('join:super_admin', () => {
      if (user.role === 'SUPER_ADMIN') {
        socket.join('super_admin');
      }
    });

    // Handle room leaving
    socket.on('leave:customer', (data) => {
      if (user.cafeId && data.cafeId === user.cafeId) {
        socket.leave(`customer:${user.cafeId}:${user.userId}`);
      }
    });

    socket.on('leave:kitchen', (data) => {
      if (user.cafeId && data.cafeId === user.cafeId) {
        socket.leave(`kitchen:${user.cafeId}`);
      }
    });

    socket.on('leave:waiter', (data) => {
      if (user.cafeId && data.cafeId === user.cafeId) {
        socket.leave(`waiter:${user.cafeId}`);
      }
    });

    socket.on('leave:manager', (data) => {
      if (user.cafeId && data.cafeId === user.cafeId) {
        socket.leave(`manager:${user.cafeId}`);
      }
    });

    socket.on('leave:cafe_admin', (data) => {
      if (user.cafeId && data.cafeId === user.cafeId) {
        socket.leave(`cafe_admin:${user.cafeId}`);
      }
    });

    socket.on('leave:super_admin', () => {
      socket.leave('super_admin');
    });

    socket.on('disconnect', () => {
      console.log(`User ${user.userId} (${user.role}) disconnected`);
    });
  });

  return io;
}

// Utility functions to emit events to specific rooms
export function emitToCafe(io: SocketIOServer, cafeId: string, event: string, data: any) {
  io.to(`cafe:${cafeId}`).emit(event, data);
}

export function emitToKitchen(io: SocketIOServer, cafeId: string, event: string, data: any) {
  io.to(`kitchen:${cafeId}`).emit(event, data);
}

export function emitToWaiter(io: SocketIOServer, cafeId: string, event: string, data: any) {
  io.to(`waiter:${cafeId}`).emit(event, data);
}

export function emitToManager(io: SocketIOServer, cafeId: string, event: string, data: any) {
  io.to(`manager:${cafeId}`).emit(event, data);
}

export function emitToCafeAdmin(io: SocketIOServer, cafeId: string, event: string, data: any) {
  io.to(`cafe_admin:${cafeId}`).emit(event, data);
}

export function emitToSuperAdmin(io: SocketIOServer, event: string, data: any) {
  io.to('super_admin').emit(event, data);
}

export function emitToCustomer(io: SocketIOServer, cafeId: string, userId: string, event: string, data: any) {
  io.to(`customer:${cafeId}:${userId}`).emit(event, data);
}
