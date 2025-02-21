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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 1 minute

    // Store OTP in DB
    await sendMail(email,`Password Reset OTP`, `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        .container {
            max-width: 480px;
            margin: 30px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
        }
        .header {
            font-size: 22px;
            font-weight: bold;
            color: #333;
        }
        .message {
            font-size: 16px;
            color: #555;
            margin-top: 15px;
        }
        .otp-input {
            display: block;
            width: 60%;
            margin: 10px auto;
            padding: 10px;
            font-size: 18px;
            text-align: center;
            border: 2px solid #ccc;
            border-radius: 5px;
        }
        .footer {
            font-size: 13px;
            color: #777;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Khdamli-Dev</div>
        <p class="header">Reset Your Password</p>
        <p class="message">Hello,</p>
        <p class="message">You're receiving this email because you requested a password reset. Enter the OTP below to reset your password.</p>
        <input type="text" class="otp-input" value="${otp}" readonly onclick="this.select();document.execCommand('copy');">
        <p class="message">If you didn't request this, you can ignore this email. Your password will remain unchanged.</p>
        <p class="footer">The Kdamli-Dev Team</p>
    </div>
</body>
</html>
` );
    res.json({ message: "OTP sent successfully" });
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
