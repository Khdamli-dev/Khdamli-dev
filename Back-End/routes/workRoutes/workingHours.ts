import express, { Router } from 'express';
import dotenv from 'dotenv';
import setWorkingHours from '../../controller/profile/setWorkingHours';
import checkRole from '../../middleware/checkRole';

const workingHours: Router = express.Router();

dotenv.config();
const workerRoleId = Number(process.env.WORKER_ROLE_ID);

// Endpoint to set working hours for the worker
workingHours.put('/:workerId', checkRole([workerRoleId]), setWorkingHours);

export default workingHours;
