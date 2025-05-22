import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSocket } from '../api/socket';
import apiClient from '../api/appClient';
import refreshAccessToken from '@/api/refreshAccessToken';
import { router } from 'expo-router';

interface NotificationContextType {
  unreadRequests: number;
  hasUnreadRequests: boolean;
  markRequestAsRead: () => void;
  unreadPublicRequests : number;
  markPublicRequestAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unreadRequests, setUnreadRequests] = useState<number>(0);
  const [unreadPublicRequests, setUnreadPublicRequests] = useState<number>(0);

  // On mount, get the unread requests count from storage
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // get unread private requests from storage (for quick loading)
        const storedCount: string | null = await AsyncStorage.getItem(
          'unreadRequestsCount',
        );
        if (storedCount) {
          setUnreadRequests(parseInt(storedCount, 10));
        } else {
          setUnreadRequests(0);
        }

        // get unread accepted public requests
        const publicRequestsStoredCount: string | null = await AsyncStorage.getItem(
          'unreadPublicRequestsCount',
        );
        if (publicRequestsStoredCount){
          setUnreadPublicRequests(parseInt(publicRequestsStoredCount, 10));
        } else {
          setUnreadPublicRequests(0);
        }

        // Then fetch latest from API
        await fetchUnreadRequestsCount();
        await fetchUnreadPublicRequestsCount();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  // Set up socket listeners for real-time updates
  useEffect(() => {
    const setupSocketListeners = async () => {
      try {
        // Ensure socket is connected
        const socket = getSocket();

        // Listen for new private requests
        socket.on('private-request', (data) => {
          console.log('New private request received:', data);
          setUnreadRequests((prev) => {
            const newCount = prev + 1;
            AsyncStorage.setItem('unreadRequestsCount', newCount.toString());
            return newCount;
          });
        });

        // Listen for new public requests
        socket.on('accept-worker-on-public-request', (data) => {
          console.log('New public request received:', data);
          setUnreadPublicRequests((prev) => {
            const newCount = prev + 1;
            AsyncStorage.setItem('unreadPublicRequestsCount', newCount.toString());
            return newCount;
          });
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

  // Fetch the current unread count from API
  const fetchUnreadRequestsCount = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (!userString) return;

      const user = JSON.parse(userString);

      const response = await apiClient.get(`/work/worker/${user.id}/private-request/unread-count`);
      if (response.data.success) {
        const count : number = response.data.count;
        setUnreadRequests(count);
        AsyncStorage.setItem('unreadRequestsCount', count.toString());
      }
    } catch (error: any) {
      if (error.response?.status == 401) {
        if (await refreshAccessToken()) {
          await fetchUnreadRequestsCount();
        } else {
          // need to login
          router.push('/(auth)');
        }
      }
      console.error('Error fetching unread requests count:', error);
    }
  };

  // fetch current accepted request count
  const fetchUnreadPublicRequestsCount = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (!userString) return;

      const user = JSON.parse(userString);
      const response = await apiClient.get(`/work/worker/${user.id}/public-request/unread-count`);
      if (response.data.success) {
        const count : number = response.data.count;
        setUnreadPublicRequests(count);
        AsyncStorage.setItem('unreadPublicRequestsCount', count.toString());
      }
    } catch (error : any) {
      if (error.response?.status == 401) {
        if (await refreshAccessToken()) {
          await fetchUnreadPublicRequestsCount();
        } else {
          // need to login
          router.push('/(auth)');
        }
      }
      console.error('Error fetching unread accepted public requests count:', error);
    }
  }

  // mark request as read
  const markRequestAsRead = () => {
    setUnreadRequests((prev) => prev - 1);
    AsyncStorage.setItem('unreadRequestsCount', unreadRequests.toString());
  };

  // mark public request as read 
  const markPublicRequestAsRead = () => {
    setUnreadPublicRequests((prev) => prev - 1);
    AsyncStorage.setItem('unreadPublicRequestsCount', unreadPublicRequests.toString());
  }

  return (
    <NotificationContext.Provider
      value={{
        unreadRequests,
        unreadPublicRequests,
        hasUnreadRequests: unreadRequests + unreadPublicRequests > 0,
        markRequestAsRead,
        markPublicRequestAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
