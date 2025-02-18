import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../database/dbConnection";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || '';

export const verifyResetToken = async (req: Request, res: Response, next: NextFunction)=> {
  try {
    const token = req.params.token;
    if (!token) {
      res.status(401).json({
        message: "Unauthorized: No reset token provided",
        success: false,
      });
      return ;
    }

    // Query the database for token existance verification
    const { rows: result } = await pool.query(
      `SELECT user_id FROM confirmation_token WHERE token=$1`,
      [token]
    );

    if (!result.length) {
      res.status(403).json({
        message: "You are forbidden",
        success: false,
        resend: false,
      });
      return ;
    }
    try {
      jwt.verify(token, JWT_SECRET) as JwtPayload;
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          res.status(400).json({
            message: "Reset token expired",
            success: false,
            resend: true, // Frontend can use this to prompt a resend request
          });
          return ;
        }
        res.status(403).json({
          message: "Forbidden: Invalid reset token",
          success: false,
          resend: false
        });
        return ;
      }

    const userId: number = result[0].user_id;
    const newPassword =req.body;
    // Delete token after successful verification
    await pool.query(`DELETE FROM confirmation_token WHERE user_id = $1`, [userId]);
    req.body.credentials = { password: newPassword };
    req.body.id = userId;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return ;
  }
};
