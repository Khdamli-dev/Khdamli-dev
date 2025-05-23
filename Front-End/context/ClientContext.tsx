// src/providers/WebSocketProvider.tsx
import React, { createContext, useContext, useEffect } from 'react';
import eventEmitter from './EventBus';
import { getSocket } from '@/api/socket';
import { Socket } from 'socket.io-client';

type ClientContextType = {
  socket: Socket | null;
};

export const ClientContext = createContext<ClientContextType | undefined>(
  undefined,
);

export const useClientContext = () => {
  const context = useContext(ClientContext);
  return context;
};

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  // Set up socket listeners for real-time updates
  const socket = getSocket();
  useEffect(() => {
    const setupSocketListeners = async () => {
      try {
        // Ensure socket is connected
        socket.on('change-request-status', (data) => {
          console.log("status changed");
          if ((data.type = 1))
            eventEmitter.emit('change-public-request-status', data);
          else eventEmitter.emit('change-private-request-status', data);
        });
        return () => {
          socket.off('new-request');
        };
      } catch (error) {
        console.error('Error setting up notification socket listeners:', error);
      }
    };

    setupSocketListeners();
  }, []);

  return (
    <ClientContext.Provider value={{ socket }}>
      {children}
    </ClientContext.Provider>
  );
};
