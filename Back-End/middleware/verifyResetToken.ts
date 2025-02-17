import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || '';

export const verifyResetToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.params.token; // Extract token from URL params

  if (!token) {
     res.status(401).json({
      message: "Unauthorized: No reset token provided",
      success: false,
    });
  }

  try {
    // Verify and decode reset token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { id: string };

    // Attach user ID to request body (so next middleware/controller can use it)
    req.body.credentials = { id: Number(decoded.id) };

    next(); 
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        message: "Forbidden: Invalid reset token",
        success: false,
      });
    } else if (error instanceof jwt.TokenExpiredError) {
     res.status(400).json({
        message: "Reset token expired",
        success: false,
        resend: true, // Frontend can use this to prompt a resend request
      });
    }
    
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
