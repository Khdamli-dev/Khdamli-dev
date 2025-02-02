import express, { Router } from 'express';
import checkInfo from '../middleware/checkInfo';
import createUser from '../controller/signupController/createUser';
import createAddress from '../controller/signupController/createAddress';
import getRegions from '../utils/address/getRegions';
import getCities from '../utils/address/getCities';


const signup: Router = express.Router();

signup.post('/credentials', checkInfo);   // we put function that create user after checkInfo

export default signup;