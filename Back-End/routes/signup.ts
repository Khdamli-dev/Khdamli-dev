import express, { Router } from 'express';
import validateInfo from '../middleware/validateInfo';
import createUser from '../controller/signupController/createUser';
import updateProfile from '../controller/profile/updateProfile';
import resendEmail from '../controller/signupController/resendEmail';
import verifyToken from '../controller/signupController/verifyToken';
import assignAddress from '../middleware/assignAddress';
import checkNotNull from '../middleware/checkNotNull';
import sendResetEmail from '../controller/profile/sendResetEmail';
import { verifyResetToken } from '../middleware/verifyResetToken';
const signup: Router = express.Router();

signup.post('/credentials', checkNotNull, validateInfo, createUser); 
signup.post('/personal-info', assignAddress , updateProfile);
signup.post('/resend-email', resendEmail);
signup.get('/confirm-email/:token', verifyToken);
signup.post('/password-reset-email', sendResetEmail);
signup.get('/reset-password/:token', verifyResetToken , updateProfile);


export default signup;
