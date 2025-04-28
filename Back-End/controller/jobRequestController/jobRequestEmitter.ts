import { Server } from 'socket.io';
import { getIo } from '../../config/websocket';
import JobRequest from '../../interface/jobRequest';
import dotenv from 'dotenv';

dotenv.config();

const jobRequestEmitter = async (request: JobRequest): Promise<void> => {
  const io: Server = getIo();
  const { type, worker } = request;
  // case of public request
  const privateRequestId : string | undefined = process.env.PRIVATE_REQUEST_ID;
  if (privateRequestId){
    if (type == +privateRequestId  && worker) {
      // private request
      io.to(worker.toString()).emit('private-request', request.id);
    }
  }
};

export default jobRequestEmitter;
