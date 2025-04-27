// socket.ts
import { io, Socket } from 'socket.io-client';
import CONFIG from '@/config';

let socket: Socket;

export const connectSocket = () => {
  socket = io(CONFIG.API_URL, {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket server, id:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });
};

export const getSocket = (): Socket => {
  if (!socket) {
    throw new Error('Socket not connected!');
  }
  return socket;
};
