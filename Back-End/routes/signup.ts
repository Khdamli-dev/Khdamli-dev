import express, { Router } from 'express';
import checkInfo from '../middleware/checkInfo';
import createUser from '../controller/signupController/createUser';
import assignAddress from '../middleware/assignAddress';
import updateProfile from '../controller/profile/updateProfile';
import resendEmail from '../controller/signupController/resendEmail';
import verifyToken from '../controller/signupController/verifyToken';

const signup: Router = express.Router();

signup.post('/credentials', checkInfo , createUser); 
signup.post('/personal-info/:id', assignAddress , updateProfile);
signup.post('/resend-email', resendEmail);
signup.get('/confirm-email/:token', verifyToken);

export default signup;