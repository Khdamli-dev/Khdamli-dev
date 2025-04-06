import express, { Router } from 'express';
import setWorkingHours from '../../controller/profile/setWorkingHours';

const workingHours: Router = express.Router();

// Endpoint to set working hours for the worker
workingHours.put('/:workerId', setWorkingHours);

export default workingHours;
