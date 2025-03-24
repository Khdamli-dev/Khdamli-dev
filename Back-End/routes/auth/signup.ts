import express, { Router } from 'express';
import validateInfo from '../../middleware/validateInfo';
import createUser from '../../controller/signupController/createUser';
import resendEmail from '../../controller/signupController/resendEmail';
import verifyToken from '../../controller/signupController/verifyToken';
import checkNotNull from '../../middleware/checkNotNull';
import ensureEmailNotValid from '../../middleware/ensureEmailNotValid';

const signup: Router = express.Router();

signup.post('/', checkNotNull, validateInfo, createUser);
signup.post('/resend-email', ensureEmailNotValid, resendEmail);
signup.get('/confirm-email/:token', verifyToken);

export default signup;
