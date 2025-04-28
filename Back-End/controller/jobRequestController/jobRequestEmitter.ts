import { Server } from 'socket.io';
import { getIo } from '../../config/websocket';
import JobRequest from '../../interface/jobRequest';
import dotenv from 'dotenv';

dotenv.config();
const io: Server = getIo();

export const sendPrivateRequest = async (
  request: JobRequest,
): Promise<void> => {
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

export const changeRequestStatus = async (request: JobRequest): Promise<void> => {
  const { type } = request;
  // determine the destination
  let destination: number | null;
  const privateRequestId: string | undefined = process.env.PRIVATE_REQUEST_ID;
  if (privateRequestId) {
    if (type === +privateRequestId) {
      destination = request.worker;
    } else {
      destination = request.client;
    }

    if (destination) {
      io.to(destination.toString()).emit('change-request-status', {
        requestId : request.id,
        status : request.status
      });
    }
  }
};
