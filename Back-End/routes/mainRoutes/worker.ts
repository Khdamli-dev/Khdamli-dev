import express, { Router } from 'express';
import jobRequestRoutes from '../workRoutes/jobRequest';
import category from '../workRoutes/categorySelection';
import payment from '../workRoutes/paymentSelection';
import workingHours from '../workRoutes/workingHours';

const worker: Router = express.Router();

worker.use('/job-request', jobRequestRoutes);
worker.use('/categories', category);
worker.use('/payment', payment);
worker.use('/working-hours', workingHours);

export default worker;
