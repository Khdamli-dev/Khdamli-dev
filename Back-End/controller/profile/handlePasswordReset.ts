import { Request, Response } from 'express';
import pool from '../../database/dbConnection';
import crypto from 'crypto';
import sendMail from '../../utils/mailer/sendMail';
import { passwordResetMail } from '../../utils/mailer/emailBody';
import produceTokens from '../../utils/authentication/produceTokens';


export const sendOTP = async (req: Request, res: Response) => {
  try {
    
    const { email, userId } = req.body.credentials;
    if (!email || !userId) {
      res.status(400).json({ 
          message: 'Email and User id are required', 
          success: false,
          userId : null 
        });
      return;
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    // send email
    await sendMail(email, `Password Reset OTP`, passwordResetMail(otp));

    // Store OTP in DB
    await pool.query(
      `INSERT INTO otp_codes (user_id, otp, expires_at, purpose) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id) DO UPDATE 
       SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at, purpose = EXCLUDED.purpose`,
      [userId, otp, expiresAt, "password_reset"]
    );
    
    res.json({
      message: 'OTP sent successfully',
      success : true,
      userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Internal server error',
      success : false,
      userId : null
    });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { id, otp } = req.body;
    if (!id || !otp) {
      res.status(400).json({
        message: 'User ID and OTP are required',
        success: false,
        resend: null,
      });
      return;
    }

    // Verify OTP from otp_codes table
    const { rows : user } = await pool.query(
      `SELECT oc.expires_at, u.*
FROM otp_codes oc
LEFT JOIN "user" u ON oc.user_id = u.id
WHERE oc.user_id = $1 AND oc.otp = $2 AND oc.purpose = $3;
`,
      [id, otp , "password_reset"],
    );
    if (!user.length) {
      res.status(400).json({
        message: 'Invalid OTP',
        success: false,
        resend: null,
      });
      return;
    }

    if (new Date() > new Date(user[0].expires_at)) {
      res.status(400).json({
        message: 'OTP has expired',
        success: false,
        resend: true,
      });
      return;
    }
    await pool.query(`
      DELETE FROM otp_codes WHERE user_id = $1
      `, [id]);
      const { accessToken, refreshToken } = produceTokens(id , user[0].role);
      const {password : _, ...returnedUser} = user[0];
    res.status(200).json({
      message: 'OTP successfully verified',
      success: true,
      user : returnedUser,
      accessToken,
      refreshToken,
      resend : null
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
      resend: null,
    });
  }
};
