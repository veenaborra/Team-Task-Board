import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8080'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);
    socket.on('disconnect', () => console.log('Socket disconnected', socket.id));
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

