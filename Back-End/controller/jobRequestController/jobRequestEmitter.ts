import { Server } from 'socket.io';
import { getIo } from '../../config/websocket';
import JobRequest from '../../interface/jobRequest';
import dotenv from 'dotenv';

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

export const changeRequestStatus = (
  request: JobRequest,
): void => {
  // determine request status
  const getRequestStatus = (statusId : number) : string | null => {
    const onholdRequestStatusId: string | undefined = process.env.ON_HOLD_REQUEST_ID;
    const acceptedRequestStatusId: string | undefined = process.env.ACCEPTED_REQUEST_ID;
    if (onholdRequestStatusId && acceptedRequestStatusId){
      switch (statusId){
        case +onholdRequestStatusId : return "On Hold";
        case +acceptedRequestStatusId : return "Accepted";
        default : return "Rejected";
      }
    }
    return null;
  }

  const io: Server = getIo();
  const privateRequestId: string | undefined = process.env.PRIVATE_REQUEST_ID;
  if (privateRequestId) {
    const client: number = request.client;
    const status: string | null = getRequestStatus(request.status);
    if (status){
      io.to(client.toString()).emit('change-request-status', {
        requestId: request.id,
        status,
      });
    }
  }
};