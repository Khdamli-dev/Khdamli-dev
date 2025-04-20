import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import dotenv from "dotenv";
import updatedEmail from "../../utils/validator/updatedEmail";


dotenv.config();

const verifyEmailConfirmationOTP = async (req: Request, res: Response) => {
  try {
    const id = +req.params.userId;
    const { otp } = req.body;
    if (!id || isNaN(id) || !otp) {
      res.status(400).json({
        message: 'User ID and OTP are required',
        success: false,
        resend: null,
      });
      return;
    }

    // Verify OTP from otp_codes table
    const { rows } = await pool.query(
      `SELECT expires_at FROM otp_codes WHERE user_id = $1 AND otp = $2 AND purpose = $3`,
      [id, otp , "account_verification"],
    );
    if (!rows.length) {
      res.status(400).json({
        message: 'Invalid OTP',
        success: false,
        resend: null,
      });
      return;
    }

    if (new Date() > new Date(rows[0].expires_at)) {
      res.status(400).json({
        message: 'OTP has expired',
        success: false,
        resend: true,
      });
      return;
    }
    updatedEmail(id);
    await pool.query(`DELETE FROM otp_codes WHERE user_id = $1`, [id]);
    await pool.query(`UPDATE "user" SET registration_date = CURRENT_DATE WHERE id = $1`, [id]);
    
    res.status(200).json({
      message: 'OTP successfully verified',
      success: true,
      resend : null
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      success: false,
      resend: null,
    });
  }
};
export default verifyEmailConfirmationOTP;
