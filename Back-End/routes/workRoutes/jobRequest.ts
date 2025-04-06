import express, { Router } from 'express';
import createRequest from '../../controller/jobRequestController/createRequest';
import validateJobRequest from '../../middleware/validateJobRequest';
import getRequest from '../../controller/jobRequestController/getRequests';
import deleteRequest from '../../controller/jobRequestController/deleteRequest';
import modifyRequest from '../../controller/jobRequestController/modifyRequest';
import { uploadMedia } from '../../controller/upload/uploadMedia';
import { updateRequestStatus } from '../../controller/jobRequestController/updateRequestStatus';
import getWorkersByName from '../../controller/jobRequestController/getWorkerByName';
import selectWorker from '../../controller/jobRequestController/selectWorker';
import createComment from '../../controller/jobRequestController/createComment';

const request: Router = express.Router();

request.post('/', validateJobRequest, createRequest);

// this route used to get private and public requests for a client or a worker
request.get('/', getRequest);

request.delete('/:requestId', deleteRequest);

request.put('/:requestId', modifyRequest );

request.put('/media/:requestId',uploadMedia);

request.put('/status/:requestId',updateRequestStatus);

request.put('/status/:requestId',updateRequestStatus)

// this route is used to select worker in public request
request.put('/:requestId/select-worker/:workerId', selectWorker);

// this route is used to make a comment on public request
request.post('/:requestId/comment', createComment);

request.get('/worker', getWorkersByName);

export default request;
