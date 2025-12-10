import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE?.replace('/api', '') || 'http://localhost:8000';

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
    });
  }
  return socket;
};

