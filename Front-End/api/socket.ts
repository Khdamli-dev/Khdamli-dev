// Modified socket.ts with improved error handling and logging
import { io, Socket } from 'socket.io-client';
import CONFIG from '@/config';

let socket: Socket;

export const connectSocket = (): Socket => {
  try {
    console.log('Attempting to connect to:', CONFIG.API_URL);
    
    // Check if we already have a socket connection
    if (socket && socket.connected) {
      console.log('Using existing socket connection');
      return socket;
    }
    
    // Create a new socket connection
    socket = io(CONFIG.API_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,  // Increase timeout to 10 seconds
    });
    
    // Set up event listeners
    socket.on('connect', () => {
      console.log('Connected to WebSocket server, id:', socket.id);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });
    
    socket.on('connect_timeout', () => {
      console.error('Connection timeout');
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server. Reason:', reason);
    });
    
    return socket;
  } catch (error) {
    console.error('Error initializing socket:', error);
    throw error;
  }
};

export const getSocket = (): Socket => {
  if (!socket || !socket.connected) {
    console.warn('Socket not connected! Attempting to connect...');
    return connectSocket();
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    console.log('Socket disconnected manually');
  }
};