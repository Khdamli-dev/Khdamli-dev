import { Request, Response, NextFunction } from "express";
import pool from "../database/dbConnection";

export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, otp, newPassword } = req.body;
    console.log("the code recieved is :", otp);
    console.log("the id of user is :", id);
    console.log("the new password is :", newPassword);
    if (!id || !otp || !newPassword) {
      res
        .status(400)
        .json({ message: "User ID, OTP, and new password are required" });
      return;
    }

    // Verify OTP from otp_codes table
    const { rows } = await pool.query(
      `SELECT expires_at FROM otp_codes WHERE user_id = $1 AND otp = $2`,
      [id, otp]
    );

    if (!rows.length || new Date() > new Date(rows[0].expires_at)) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    req.body.credentials = { password: newPassword }; // Set new password in credentials
    await pool.query(`DELETE FROM otp_codes WHERE user_id = $1`, [id]);
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
