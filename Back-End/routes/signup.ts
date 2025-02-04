import express, { Router } from 'express';
import checkInfo from '../middleware/checkInfo';
import createUser from '../controller/signupController/createUser';
import assignAddress from '../middleware/assignAddress';
import setPersonalInfo from '../utils/update/setPersonalInfo';
import updateProfile from '../controller/profile/updateProfile';


const signup: Router = express.Router();

signup.post('/credentials', checkInfo , createUser); 

signup.post('/personal-info/:id', updateProfile);

export default signup;