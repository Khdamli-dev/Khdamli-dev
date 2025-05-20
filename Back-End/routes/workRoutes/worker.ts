import express, { Router } from 'express';
import { getWorkers } from '../../controller/workerController/getWorkers';
import getWorkersByName from '../../controller/jobRequestController/getWorkerByName';
import getUnreadCount from '../../controller/workerController/getUnreadCount';
import checkRole from '../../middleware/checkRole';
import dotenv from 'dotenv';

dotenv.config();

const worker: Router = express.Router();

const workerRoleId = Number(process.env.WORKER_ROLE_ID);

// here i need to know if worker has right to get and search for workers 
worker.get('/:userId/', getWorkers);
worker.get('/', getWorkersByName);
worker.get('/:worker/unread-count', checkRole([workerRoleId]), getUnreadCount);

export default worker;
