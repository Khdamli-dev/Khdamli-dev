import express, { Router } from 'express';
import createRequest from '../../controller/jobRequestController/createRequest';
import validateJobRequest from '../../middleware/validateJobRequest';
import getPrivateRequest from '../../controller/jobRequestController/getPrivateRequest';

const request:Router = express.Router();

request.post('/create', validateJobRequest, createRequest);

// this route used to get private requests for a client or a worker
request.get('/get/private', getPrivateRequest);

export default request;
