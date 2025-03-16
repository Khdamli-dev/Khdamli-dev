import express, { Router } from 'express';
import createRequest from '../../controller/jobRequestController/createRequest';
import validateJobRequest from '../../middleware/validateJobRequest';
import getRequest from '../../controller/jobRequestController/getRequests';

const request: Router = express.Router();

request.post('/', validateJobRequest, createRequest);
// this route used to get private and public requests for a client or a worker
request.get('/', getRequest);

export default request;
