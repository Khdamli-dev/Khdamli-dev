import express, { Router } from 'express';
import { sendOTP } from '../../controller/profile/handlePasswordReset';
import { verifyOTP } from '../../middleware/verifyOtp';
import updateProfile from '../../controller/profile/updateProfile';
import assignAddress from '../../middleware/assignAddress';
import role from './role';

const update: Router = express.Router();

update.post('/user-info', assignAddress, updateProfile);
update.post('/password-reset/request', sendOTP); // Request OTP for password reset
update.post('/password-reset/reset', verifyOTP, updateProfile);
update.use('/role', role);

export default update;
