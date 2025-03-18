import express, { Router } from 'express';
import { sendOTP , verifyOTP } from '../../controller/profile/handlePasswordReset';
import updateProfile from '../../controller/profile/updateProfile';
import assignAddress from '../../middleware/assignAddress';
import role from './role';
import canSendOTP from '../../middleware/canSendOTP';
import { uploadProfilePicture } from '../../controller/upload/uploadProfilePicture';

const update: Router = express.Router();

update.post('/user-info', assignAddress, updateProfile );
update.post('/password-reset/request',canSendOTP ,sendOTP); // Request OTP for password reset
update.post('/password-reset/verify', verifyOTP);
update.use('/role', role);
update.put('/profile-picture/:id',uploadProfilePicture);

export default update;
