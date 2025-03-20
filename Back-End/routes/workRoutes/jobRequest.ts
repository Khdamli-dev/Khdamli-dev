import express, { Router } from 'express';
import createRequest from '../../controller/jobRequestController/createRequest';
import validateJobRequest from '../../middleware/validateJobRequest';
import getPrivateRequest from '../../controller/jobRequestController/getPrivateRequest';
import getPublicRequest from '../../controller/jobRequestController/getPublicRequest';
import deleteRequest from '../../controller/jobRequestController/deleteRequest';
import { uploadMedia } from '../../controller/upload/uploadMedia';
import modifyRequest from '../../controller/jobRequestController/modifyRequest';
import { updateRequestStatus } from '../../controller/jobRequestController/updateRequestStatus';
import getWorkersByName from '../../controller/jobRequestController/getWorkerByName';

const request: Router = express.Router();

request.post("/create", validateJobRequest, createRequest);
// this route used to get private requests for a client or a worker
request.get("/get/private", getPrivateRequest);
// this route used to get public requests of client

request.get('/get/public/:client', getPublicRequest);

request.delete('/:requestId', deleteRequest);

request.put('/:requestId', modifyRequest );

request.put('/media/:requestId',uploadMedia);

request.put('/status/:requestId',updateRequestStatus)

request.get('/worker', getWorkersByName);
export default request;
