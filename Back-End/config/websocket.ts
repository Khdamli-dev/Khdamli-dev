import { Server, Socket } from 'socket.io';
import http from 'http';

let io: Server;

export const initializeWebSocket = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:8081',
        'http://127.0.0.1:5500',
        'http://localhost:5500',
      ], // origins that allowed to make requests
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`client connected to websocket with id : ${socket.id}`);

    socket.on('worker-room', async (workerId: number) => {
      // create private room for worker
      const roomName: string = workerId.toString();
      socket.join(roomName);
      console.log(`worker join to his private room ${roomName}`);
    });

    // disconnect event
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error('websocket not initialized');
  }
  return io;
};
