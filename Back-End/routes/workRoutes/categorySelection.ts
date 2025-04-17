import express, { Router } from 'express';
import dotenv from 'dotenv';
import getCategories from '../../utils/category/getCategories';
import addWorkerCategory from '../../controller/profile/addWorkerCategory';
import checkRole from '../../middleware/checkRole';

const category: Router = express.Router();

dotenv.config();
const workerRoleId = Number(process.env.WORKER_ROLE_ID);

category.get('/', getCategories);
category.post('/:workerId', checkRole([workerRoleId]), addWorkerCategory);

export default category;
