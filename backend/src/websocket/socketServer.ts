import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../features/auth/utils/jwt';
import { setSocketIO } from '../features/checkin/controllers/checkinController';
import { setClubSocketIO } from '../features/club/controllers/clubController';
import { setChatSocketIO } from '../features/club/controllers/chatController';
import { setEventSocketIO } from '../features/event/controllers/eventController';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

let io: SocketIOServer | null = null;

export const initializeSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Set socket.io instance in check-in controller
  setSocketIO(io);
  // Set socket.io instance in club controller
  setClubSocketIO(io);
  // Set socket.io instance in chat controller
  setChatSocketIO(io);
  // Set socket.io instance in event controller
  setEventSocketIO(io);

  io.use(async (socket: Socket, next) => {
    try {
      // Parse cookies from handshake headers
      const cookieHeader = socket.handshake.headers.cookie;
      let token: string | null = null;

      if (cookieHeader) {
        // Parse cookie string to extract access_token
        const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        }, {});
        
        token = cookies.access_token || null;
      }

      // Fallback to auth.token or Authorization header for backward compatibility
      if (!token) {
        token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '') || null;
      }
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token);
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(`✅ WebSocket client connected: ${user?.email || 'unknown'}`);

    // Store joined rooms for reconnection
    const joinedRooms = new Set<string>();

    // Join event room
    socket.on('join-event', (eventId: number) => {
      const room = `event-${eventId}`;
      socket.join(room);
      joinedRooms.add(room);
      console.log(`📥 User ${user?.email} joined room: ${room}`);
    });

    // Leave event room
    socket.on('leave-event', (eventId: number) => {
      const room = `event-${eventId}`;
      socket.leave(room);
      joinedRooms.delete(room);
      console.log(`📤 User ${user?.email} left room: ${room}`);
    });

    // Join club room (for leaders to get real-time updates)
    socket.on('join-club', (clubId: number) => {
      const room = `club-${clubId}`;
      socket.join(room);
      joinedRooms.add(room);
      console.log(`📥 User ${user?.email} joined club room: ${room}`);
    });

    // Leave club room
    socket.on('leave-club', (clubId: number) => {
      const room = `club-${clubId}`;
      socket.leave(room);
      joinedRooms.delete(room);
      console.log(`📤 User ${user?.email} left club room: ${room}`);
    });

    // Join club chat room
    socket.on('join-club-chat', (clubId: number) => {
      const room = `club-chat-${clubId}`;
      socket.join(room);
      joinedRooms.add(room);
      console.log(`📥 User ${user?.email} joined club chat room: ${room}`);
    });

    // Leave club chat room
    socket.on('leave-club-chat', (clubId: number) => {
      const room = `club-chat-${clubId}`;
      socket.leave(room);
      joinedRooms.delete(room);
      console.log(`📤 User ${user?.email} left club chat room: ${room}`);
    });

    // Typing indicators for club chat
    socket.on('user-typing', async (data: { clubId: number }) => {
      if (!user?.userId) return;
      
      const room = `club-chat-${data.clubId}`;
      
      // Fetch user's name from database
      try {
        const [rows] = await pool.execute<RowDataPacket[]>(
          'SELECT first_name, last_name FROM users WHERE id = ?',
          [user.userId]
        );
        
        const userName = rows.length > 0 
          ? `${rows[0].first_name} ${rows[0].last_name}`
          : user.email || 'Unknown User';
        
        // Emit to all users in the room except the sender
        socket.to(room).emit('user-typing', {
          clubId: data.clubId,
          userId: user.userId,
          userName,
        });
      } catch (error) {
        console.error('Error fetching user name for typing indicator:', error);
        // Fallback to email if database query fails
        socket.to(room).emit('user-typing', {
          clubId: data.clubId,
          userId: user.userId,
          userName: user.email || 'Unknown User',
        });
      }
    });

    socket.on('user-stopped-typing', (data: { clubId: number }) => {
      const room = `club-chat-${data.clubId}`;
      // Emit to all users in the room except the sender
      socket.to(room).emit('user-stopped-typing', {
        clubId: data.clubId,
        userId: user?.userId,
      });
    });

    // Join user-specific room for personal notifications
    if (user?.userId) {
      const userRoom = `user-${user.userId}`;
      socket.join(userRoom);
      joinedRooms.add(userRoom);
      console.log(`📥 User ${user?.email} joined user room: ${userRoom}`);
    }

    // Handle reconnection - rejoin all previously joined rooms
    socket.on('reconnect', () => {
      console.log(`🔄 User ${user?.email} reconnected, rejoining ${joinedRooms.size} rooms`);
      joinedRooms.forEach(room => {
        socket.join(room);
        console.log(`📥 User ${user?.email} rejoined room: ${room}`);
      });
    });

    socket.on('disconnect', () => {
      console.log(`❌ WebSocket client disconnected: ${user?.email || 'unknown'}`);
      // Note: joinedRooms will be cleared when socket disconnects
      // On reconnect, the client should re-emit join events
    });
  });

  return io;
};

export const getSocketIO = (): SocketIOServer | null => {
  return io;
};

