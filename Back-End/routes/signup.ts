import express, { Router } from 'express';
import checkInfo from '../middleware/checkInfo';
import createUser from '../controller/signupController/createUser';
import assignAddress from '../middleware/assignAddress';
import updateUserInformation from '../utils/update/updateUserInformation';


const signup: Router = express.Router();

signup.post('/credentials', checkInfo , createUser); 

signup.post('/addInfo', assignAddress , updateUserInformation );
  // we put function that create user after checkInfo

export default signup;