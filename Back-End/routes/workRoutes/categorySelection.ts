import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv';
import getCategories from '../../utils/category/getCategories';
import addWorkerCategory from '../../controller/profile/addWorkerCategory';
import checkRole from '../../middleware/checkRole';

const category: Router = express.Router();

dotenv.config();
const workerRoleId = Number(process.env.WORKER_ROLE_ID);

category.get('/', getCategories);
// category.get('/sub-category', async (req : Request , res : Response) => {
// try {
//    const {category} = req.query;
// } catch (err) {
//     console.error(err);
//     res.status(500).json({
//      message : 'internal error',
//      success : false
//     });
// }
// })
category.post('/:workerId', checkRole([workerRoleId]), addWorkerCategory);

export default category;
