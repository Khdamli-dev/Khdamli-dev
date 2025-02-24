import express, { Router } from 'express';
import createRequest from '../../controller/jobRequestController/createRequest';
import validateJobRequest from '../../middleware/validateJobRequest';

const request:Router = express.Router();

// Endpoint: POST /job-request/create
request.post('/create', validateJobRequest, createRequest);

export default request;
