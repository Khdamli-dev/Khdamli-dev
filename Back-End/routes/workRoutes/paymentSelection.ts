import express, { Router } from 'express';
import dotenv from 'dotenv';
import getPaymentMethods from '../../utils/payment/getPaymentMethods';
import addWorkerPayment from '../../controller/profile/addWorkerPayment';
import checkRole from '../../middleware/checkRole';

const payment: Router = express.Router();

dotenv.config();
const workerRoleId = Number(process.env.WORKER_ROLE_ID);

// Endpoint to fetch all available payment methods
payment.get('/', getPaymentMethods);
// Endpoint to add selected payment methods for a worker
payment.post('/:workerId', checkRole([workerRoleId]), addWorkerPayment);

export default payment;
