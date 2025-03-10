import express, { Router } from 'express';
import getCategories from '../../utils/category/getCategories';
import addWorkerCategory from '../../controller/profile/addWorkerCategory';

const category: Router = express.Router();

category.get('/', getCategories);
category.post('/', addWorkerCategory);

export default category;
