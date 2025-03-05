import { Request, Response, NextFunction } from 'express';
import Credentials from '../interface/credentials';
import pool from '../database/dbConnection';

const canSendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email }: Credentials = req.body.credentials;
    if (!email) {
      res.status(400).json({
        message: 'Email is required',
        success: false,
        validEmail : null,
        validAccount : null
      });
      return;
    }

    // check if user exist
    const { rows: user } = await pool.query(`
    SELECT id, registration_date FROM "user" 
    WHERE email = $1
    `,[email]);
    if (!user.length) {
      res.status(404).json({ 
        message: 'User not found',
        success: false,
        validEmail : false,
        validAccount : null
      });
      return;
    }

    // check if his account is valid
    if (!user[0].registration_date){
      res.status(403).json({
        message : "you need to validate your account first",
        success: false,
        validEmail : true,
        validAccount : false
      });
      return;
    }

    const id: number = user[0].id;
    req.body.credentials.userId = id;

    // check if it has otp code
    const { rows: otp } = await pool.query(`
    SELECT expires_at FROM otp_codes
    WHERE user_id=$1
    `,[id]);
    if (!otp.length) {
      next();
      return;
    }
    if (new Date() <= new Date(otp[0].expires_at)) {
      res.status(429).json({
        message:
          'OTP resend not allowed. Please wait until the previous OTP expires.',
        success: false,
        validEmail : true,
        validAccount : true
      });
      return;
    }

    // case of otp was expired
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'internal server error',
      success: false
    });
  }
};

export default canSendOTP;
