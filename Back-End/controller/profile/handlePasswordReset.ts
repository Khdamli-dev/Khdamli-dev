import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import crypto from "crypto";
import sendMail from "../../utils/mailer/sendMail";
import { passwordResetMail} from "../../utils/mailer/emailBody";

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body.credentials;
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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    // Store OTP in DB
    await sendMail(email,`Password Reset OTP`, passwordResetMail(otp));
  
    await pool.query(
      `INSERT INTO otp_codes (user_id, otp, expires_at) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id) DO UPDATE SET otp = $2, expires_at = $3`,
      [userId, otp, expiresAt]
    );
    res.json({
      message: "OTP sent successfully" ,
      id : userId
   });
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { id, otp } = req.body;

    if (!id || !otp) {
     res.status(400).json({ 
      message: "User ID and OTP are required" ,
      success : false,
      resend : false
    });
     return ;
    }

    // Verify OTP from otp_codes table
    const { rows } = await pool.query(
      `SELECT expires_at FROM otp_codes WHERE user_id = $1 AND otp = $2`,
      [id, otp]
    );

    if (!rows.length) {
      res.status(400).json({
         message: "Invalid OTP" ,
         success : false,
         resend : false
        });
      return ;
    }

    if (new Date() > new Date(rows[0].expires_at)) {
      res.status(400).json({
         message: "OTP has expired" ,
         success : false,
         resend : true
        });
      return ;
    }

    await pool.query(`DELETE FROM otp_codes WHERE user_id = $1`, [id]);
    res.status(200).json({ 
      message: "OTP successfully verified" ,
      success : true
    });
    return ;

  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ 
      message: "Internal server error" , 
      success : false,
      resend : false
    });
    return ;
  }
};
