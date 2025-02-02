import express, { Router } from 'express';
import checkInfo from '../middleware/checkInfo';
import getRegions from '../utils/address/getRegions';
import getCities from '../utils/address/getCities';

const signup: Router = express.Router();

signup.post('/credentials', checkInfo);   // we put function that create user after checkInfo
signup.get('/regions', getRegions);
signup.get('/cities', getCities);

export default signup;