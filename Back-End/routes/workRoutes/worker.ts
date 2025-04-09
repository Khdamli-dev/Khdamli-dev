import express, { Router } from 'express';
import { getWorkers } from '../../controller/workerController/getWorkers';
import getWorkersByName from '../../controller/jobRequestController/getWorkerByName';

const worker: Router = express.Router();

worker.get('/:userId/', getWorkers);
worker.get('/', getWorkersByName);

export default worker;
