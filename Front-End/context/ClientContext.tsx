import React, { createContext, useContext, useEffect, useRef } from 'react';
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
  const socketRef = useRef<Socket | null>(null);
  const listenersSetupRef = useRef(false);

  useEffect(() => {
    const setupSocketListeners = () => {
      try {
        // Get socket instance
        const socket = getSocket();
        socketRef.current = socket;

        // Only setup listeners once
        if (listenersSetupRef.current) {
          return;
        }

        console.log('Setting up socket listeners...');

        // Listen for request status changes
        socket.on('change-request-status', (data) => {
          console.log('Status changed:', data);
          
          // Fix: Use == for comparison, not = (assignment)
          if (data.type == 1) {
            eventEmitter.emit('change-public-request-status', data);
          } else {
            eventEmitter.emit('change-private-request-status', data);
          }
        });

        // Optional: Listen for connection events
        socket.on('connect', () => {
          console.log('Socket connected:', socket.id);
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected');
        });

        socket.on('error', (error) => {
          console.error('Socket error:', error);
        });

        listenersSetupRef.current = true;

      } catch (error) {
        console.error('Error setting up socket listeners:', error);
      }
    };

    setupSocketListeners();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket listeners...');
        socketRef.current.off('change-request-status');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('error');
        listenersSetupRef.current = false;
      }
    };
  }, []); // Empty dependency array - only run once

  return (
    <ClientContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </ClientContext.Provider>
  );
};