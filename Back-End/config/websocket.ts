import { Server, Socket } from 'socket.io';
import http from 'http';
import getWorkerParentCategories from '../utils/category/getWorkerParentCategories';

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

    socket.on('worker-rooms', async (workerId: number) => {
      // create private room for worker
      const roomName: string = workerId.toString();
      socket.join(roomName);
      console.log(`worker join to his private room ${roomName}`);

      // create public room for workers who have the same parent_category
      const workerCategories: string[] = await getWorkerParentCategories(workerId);
      for (const category in workerCategories) {
        socket.join(category);
        console.log(`worker join to public room ${category}`);
      }
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
