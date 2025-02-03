import express, { Router } from 'express';
import checkInfo from '../middleware/checkInfo';
import createUser from '../controller/signupController/createUser';
import createAddress from '../utils/address/createAddress';
import getRegions from '../utils/address/getRegions';
import getCities from '../utils/address/getCities';
import assignAddress from '../middleware/assignAddress';
import updateUserInformation from '../controller/signupController/updateUserInformation';


const signup: Router = express.Router();

signup.post('/credentials', checkInfo , createUser); 

signup.post('/addInfo', assignAddress , updateUserInformation );
  // we put function that create user after checkInfo

export default signup;