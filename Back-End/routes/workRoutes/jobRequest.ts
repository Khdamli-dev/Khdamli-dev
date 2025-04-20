import express, { Router } from 'express';
import dotenv from 'dotenv';
import createRequest from '../../controller/jobRequestController/createRequest';
import validateJobRequest from '../../middleware/validateJobRequest';
import getRequest from '../../controller/jobRequestController/getRequests';
import deleteRequest from '../../controller/jobRequestController/deleteRequest';
import modifyRequest from '../../controller/jobRequestController/modifyRequest';
import { uploadMedia } from '../../controller/upload/uploadMedia';
import { updateRequestStatus } from '../../controller/jobRequestController/updateRequestStatus';
import selectWorker from '../../controller/jobRequestController/selectWorker';
import createComment from '../../controller/jobRequestController/createComment';
import getRequestMessages from '../../controller/jobRequestController/getRequestMessages';
import getRequestDetails from '../../controller/jobRequestController/getRequestDetails';
import checkRole from '../../middleware/checkRole';

const request: Router = express.Router();

dotenv.config();
const clientRoleId = Number(process.env.CLIENT_ROLE_ID);
const workerRoleId = Number(process.env.WORKER_ROLE_ID);

request.post('/', checkRole([clientRoleId]), validateJobRequest, createRequest);

// this route used to get private and public requests for a client or a worker
request.get('/', getRequest);

request.delete('/:requestId', checkRole([clientRoleId]), deleteRequest);

request.put('/:requestId', checkRole([clientRoleId]), modifyRequest);

request.put('/media/:requestId', checkRole([clientRoleId]),uploadMedia);

request.put('/status/:requestId',updateRequestStatus);

// this route is used to select worker in public request
request.put('/:requestId/select-worker/:workerId', checkRole([clientRoleId]), selectWorker);

// this route is used to make a comment on public request
request.post('/:requestId/comment', checkRole([workerRoleId]), createComment);

request.get('/:requestId/messages', getRequestMessages);

export default request;
