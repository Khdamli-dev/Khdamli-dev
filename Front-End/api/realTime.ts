import React from 'react';
import { getSocket } from './socket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WorkerPrivateRequest,
  ClientPrivateRequest,
  WorkerPublicRequest,
  ClientPublicRequest,
} from '@/Interfaces/Requestsinterfaces';

export const realTimeRequests = async (
  setFunc: React.Dispatch<React.SetStateAction<number[]>>,
) => {
  const workerRoleId: string | undefined = process.env.WORKER_ROLE_ID;
  if (workerRoleId) {
    const role = await AsyncStorage.getItem('role');
    if (role == workerRoleId) {
      const socket = getSocket();
      socket.on('private-request', (data) => {
        setFunc((prev) => [...prev, data]);
      });
    }
  }
};

export const realTimePrivateRequestStatus = async (
  setFunc: React.Dispatch<
    React.SetStateAction<(ClientPrivateRequest)[]>
  >,
) => {
  const socket = getSocket();
  socket.on('change-request-status', (data) => {
    setFunc((prev) =>
      prev.map((request) =>
        request.id === data.id ? { ...request, status: data.status } : request,
      ),
    );
  });
};

export const realTimePublicRequestStatus = async (
  setFunc: React.Dispatch<
    React.SetStateAction<(ClientPublicRequest)[]>
  >,
) => {
  const socket = getSocket();
  socket.on('change-request-status', (data) => {
    setFunc((prev) =>
      prev.map((request) =>
        request.id === data.id ? { ...request, status: data.status } : request,
      ),
    );
  });
};
