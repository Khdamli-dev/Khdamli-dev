import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import crypto from "crypto";
import sendMail from "../../utils/mailer/sendMail";

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" ,
        success : false,
      });
      return;
    }
    const { rows } = await pool.query(`SELECT id FROM "user" WHERE email = $1`, [email]);
    if (!rows.length) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const userId = rows[0].id;
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 60 * 1000); // Expires in 1 minute

    // Store OTP in DB
    await pool.query(
      `INSERT INTO otp_codes (user_id, otp, expires_at) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id) DO UPDATE SET otp = $2, expires_at = $3`,
      [userId, otp, expiresAt]
    );
    await sendMail(email,`Password Reset OTP`, `Your OTP is: ${otp}. It expires in 10 minutes.` );
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
