import express, { Router } from 'express';
import checkInfo from '../controller/signupController/checkInfo';
import getRegions from '../utils/address/getRegions';
import getCities from '../utils/address/getCities';

const signup: Router = express.Router();

signup.post('/checkInfo', checkInfo);
signup.get('/regions', getRegions);
signup.get('/cities', getCities);

export default signup;