import express, { Router } from 'express';
import signup from '../auth/signup';
import login from '../auth/login';
import { sendOTP , verifyOTP } from '../../controller/profile/handlePasswordReset';
import canSendOTP from '../../middleware/canSendOTP';

const auth : Router = express.Router();

auth.use('/signup', signup);
auth.post("/login", login);
auth.post('/password-reset/request',canSendOTP ,sendOTP); // Request OTP for password reset
auth.post('/password-reset/verify', verifyOTP);

export default auth;