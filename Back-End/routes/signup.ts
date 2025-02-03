import express, { Router } from 'express';
import checkInfo from '../middleware/checkInfo';
import setPersonalInfo from '../utils/update/setPersonalInfo';

const signup: Router = express.Router();

signup.post('/credentials', checkInfo);   // we put function that create user after checkInfo
signup.post('/personal-info', setPersonalInfo);

export default signup;