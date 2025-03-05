import { Request, Response, NextFunction } from "express";
import Credentials from "../interface/credentials";
import pool from "../database/dbConnection";
import { error } from "console";
export const canSendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("hhhhhhhh");
  try {
    const { email }: Credentials = req.body.credentials;
    if (!email) {
      res.status(400).json({
        message: "Email is required",
        success: false,
        resend: false,
      });
      return;
    }
    const { rows } = await pool.query(
      `
    SELECT oc.* FROM otp_codes oc
JOIN "user" u ON u.id = oc.user_id
WHERE u.email =$1`,
      [email]
    );
    if (!rows.length) {
      next();
      return;
    }
    if (new Date() <= new Date(rows[0].expires_at)) {
      res.status(429).json({
        message:
          "OTP resend not allowed. Please wait until the previous OTP expires.",
        success: false,
        resend: false,
      });
      return;
    }
    await pool.query(
      `DELETE FROM otp_codes WHERE user_id = (SELECT id FROM "user" WHERE email = $1)`,
      [email]
    );
    next();
    return;
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "internal server error from can send otp",
      success: false,
      resend: false,
    });
    return;
  }
};
