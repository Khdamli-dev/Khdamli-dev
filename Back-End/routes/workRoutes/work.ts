import express, { Router } from 'express';
import jobRequestRoutes from './jobRequest';
import category from './categorySelection';
import payment from './paymentSelection';
import workingHours from './workingHours';

const work: Router = express.Router();

work.use('/job-request', jobRequestRoutes);
work.use('/category', category);
work.use('/payment', payment);
work.use('/working-hours', workingHours);

export default work;
