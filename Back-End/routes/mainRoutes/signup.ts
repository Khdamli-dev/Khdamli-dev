import express, { Router } from 'express';
import validateInfo from '../../middleware/validateInfo';
import createUser from '../../controller/signupController/createUser';
import updateProfile from '../../controller/profile/updateProfile';
import resendEmail from '../../controller/signupController/resendEmail';
import verifyToken from '../../controller/signupController/verifyToken';
import assignAddress from '../../middleware/assignAddress';
import checkNotNull from '../../middleware/checkNotNull';
import ensureEmailNotValid from '../../middleware/ensureEmailNotValid';
import { sendOTP } from "../../controller/profile/handlePasswordReset";
import { verifyOTP } from "../../middleware/verifyOtp"; 
const signup: Router = express.Router();

signup.post('/credentials', checkNotNull, validateInfo, createUser);
signup.post('/update-profile', assignAddress, updateProfile);
signup.post('/resend-email', ensureEmailNotValid, resendEmail);
signup.get('/confirm-email/:token', verifyToken);
signup.post("/password-reset/request", sendOTP); // Request OTP for password reset
signup.post("/password-reset/reset", verifyOTP, updateProfile);

export default signup;
