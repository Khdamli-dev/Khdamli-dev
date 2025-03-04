import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import crypto from "crypto";
import sendMail from "../../utils/mailer/sendMail";
import { passwordResetMail } from "../../utils/mailer/emailBody";
import { log } from "console";

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required", success: false });
      return;
    }

    const { rows } = await pool.query(
      `SELECT id FROM "user" WHERE email = $1`,
      [email]
    );

    if (!rows.length) {
      res.status(404).json({ message: "User not found" });

      return;
    }
    const userId = rows[0].id;
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes
    console.log(otp);

    // Store OTP in DB
    await sendMail(email, `Password Reset OTP`, passwordResetMail(otp));
    res.status(200).json({ message: "OTP sent successfully", userId: userId });
    await pool.query(
      `INSERT INTO otp_codes (user_id, otp, expires_at) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id) DO UPDATE SET otp = $2, expires_at = $3`,
      [userId, otp, expiresAt]
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
