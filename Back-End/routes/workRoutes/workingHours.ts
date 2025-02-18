import express, { Router } from 'express';
import setWorkingHours from '../../controller/profile/setWorkingHours';
import validateWorkingHours from '../../middleware/validateWorkingHours';

const workingHours: Router = express.Router();

// Endpoint to set working hours for the worker
workingHours.post('/set-hours', validateWorkingHours, setWorkingHours);

export default workingHours;
