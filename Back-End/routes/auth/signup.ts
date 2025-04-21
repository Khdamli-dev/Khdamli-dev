import express, { Router } from 'express';
import validateInfo from '../../middleware/validateInfo';
import createUser from '../../controller/signupController/createUser';
import resendEmail from '../../controller/signupController/resendEmail';
import checkNotNull from '../../middleware/checkNotNull';
import ensureEmailNotValid from '../../middleware/ensureEmailNotValid';
import verifyEmailConfirmationOTP from '../../controller/signupController/verifyEmailConfirmationOtp';

const signup: Router = express.Router();

signup.post('/', checkNotNull, validateInfo, createUser);
signup.post('/resend-email/:userId', ensureEmailNotValid, resendEmail);
signup.post('/confirm-email/:userId', verifyEmailConfirmationOTP);

export default signup;
