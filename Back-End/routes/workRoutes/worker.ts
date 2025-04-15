import express, { Router } from 'express';
import { getWorkers } from '../../controller/workerController/getWorkers';
import getWorkersByName from '../../controller/jobRequestController/getWorkerByName';

const worker: Router = express.Router();

// here i need to know if worker has right to get and search for workers 
worker.get('/:userId/', getWorkers);
worker.get('/', getWorkersByName);

export default worker;
