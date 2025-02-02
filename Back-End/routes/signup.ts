import express, { Router } from 'express';
import checkInfo from '../controller/signupController/checkInfo';
import getRegions from '../utils/address/getRegions';
import getCities from '../utils/address/getCities';
import createUser from '../controller/signupController/createUser';
import createAddress from '../controller/signupController/createAddress';

const signup: Router = express.Router();

signup.post('/checkInfo', checkInfo);
signup.get('/regions', getRegions);
signup.get('/cities', getCities);
signup.post('/createUser',createUser);
signup.post('/createAddress',createAddress);

export default signup;