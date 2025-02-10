import express, {Router} from 'express';
import getCategories from '../utils/category/getCategories';
import addWorkerCategory from '../controller/profile/addWorkerCategory';
import validateCategorySelection from '../middleware/validateCategorySelection';


const category:Router = express.Router();

category.get('/get-category', getCategories);
category.post('/add-category', validateCategorySelection, addWorkerCategory);


export default category;