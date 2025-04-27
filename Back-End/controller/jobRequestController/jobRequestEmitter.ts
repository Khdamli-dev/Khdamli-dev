import { Server } from 'socket.io';
import { getIo } from '../../config/websocket';
import JobRequest from '../../interface/jobRequest';
import getParentCategory from '../../utils/category/getParentCategory';

const jobRequestEmitter = async (request: JobRequest): Promise<void> => {
  const io: Server = getIo();
  const { type, worker, category } = request;
  // case of public request
  if (type == 1) {
    const parentCategory: string = await getParentCategory(category);
    if (parentCategory) io.to(parentCategory).emit('public-request', request.id);
  } else if (worker) {
    // private request
    io.to(worker.toString()).emit('private-request', request.id);
  }
};

export default jobRequestEmitter;
