import express, { Router } from 'express';
import { getWorkers } from '../../controller/workerController/getWorkers';
import getWorkersByName from '../../controller/jobRequestController/getWorkerByName';
import getUnreadCount from '../../controller/workerController/getUnreadCount';
import checkRole from '../../middleware/checkRole';
import dotenv from 'dotenv';
import getAccesptedPublicRequestsCount from '../../controller/workerController/getAcceptedPublicRequestsCount';
import getReviews from '../../controller/workerController/getReviews';

dotenv.config();

const worker: Router = express.Router();

const workerRoleId = Number(process.env.WORKER_ROLE_ID);

worker.get('/:userId/', getWorkers);
worker.get('/', getWorkersByName);
worker.get('/:worker/private-request/unread-count', checkRole([workerRoleId]), getUnreadCount);
worker.get('/:worker/public-request/unread-count', checkRole([workerRoleId]), getAccesptedPublicRequestsCount);
worker.get('/:workerId/reviews', getReviews);

export default worker;
