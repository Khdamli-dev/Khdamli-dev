import { Server } from 'socket.io';
import { getIo } from '../../config/websocket';
import JobRequest from '../../interface/jobRequest';
import dotenv from 'dotenv';
import pool from '../../database/dbConnection';

dotenv.config();

export const sendPrivateRequest = async (
  request: JobRequest,
): Promise<void> => {
  const io: Server = getIo();
  const { type, worker } = request;
  // case of public request
  const privateRequestId: string | undefined = process.env.PRIVATE_REQUEST_ID;
  if (privateRequestId) {
    if (type == +privateRequestId && worker) {
      // private request
      io.to(worker.toString()).emit('private-request', request.id);
    }
  }
};

export const acceptWorkerOnPublicRequest = async (
  request: JobRequest,
): Promise<void> => {
  const io: Server = getIo();
  const { worker } = request;
  if (worker)
    io.to(worker.toString()).emit(
      'accept-worker-on-public-request',
      request.id,
    );
};

export const changeRequestStatus = async (
  request: JobRequest,
): Promise<void> => {
  const io: Server = getIo();
  const { type } = request;
  // determine the destination
  const privateRequestId: string | undefined = process.env.PRIVATE_REQUEST_ID;
  if (privateRequestId && type === +privateRequestId) {
    if (type === +privateRequestId) {
      // worker change private request status, so destination => client
      const status = await pool.query(
        `
      SELECT name FROM request_status
      WHERE id = $1
      `,
        [request.id],
      );

      const client: number = request.client;
      io.to(client.toString()).emit('change-request-status', {
        requestId: request.id,
        status,
      });
    }
  }
};
