import sendMail from "../mailer/sendMail";
import crypto from 'crypto';
import pool from "../../database/dbConnection";
import { emailConfirmationMail } from "../mailer/emailBody";
export const sendEmailConfirmationMail = async (email : string , userId : number) => {
    const otp = crypto.randomInt(100000, 999999).toString();
const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

// send email
await sendMail(email, `Password Reset OTP`, emailConfirmationMail(otp));

// Store OTP in DB
await pool.query(
  `INSERT INTO otp_codes (user_id, otp, expires_at, purpose) 
   VALUES ($1, $2, $3, $4) 
   ON CONFLICT (user_id) DO UPDATE 
   SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at, purpose = EXCLUDED.purpose`,
  [userId, otp, expiresAt, "account_verification"]
);
}