import express, { Router } from 'express';
import jobRequestRoutes from '../workRoutes/jobRequest';
import category from '../workRoutes/categorySelection';
import payment from '../workRoutes/paymentSelection';
import workingHours from '../workRoutes/workingHours';
import worker from '../workRoutes/worker';

const work: Router = express.Router();

work.use('/job-request', jobRequestRoutes);
work.use('/category', category);
work.use('/payment', payment);
work.use('/working-hours', workingHours);
work.use('/worker',worker);

export default work;
