import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import pool from '../../database/dbConnection';
import dotenv from 'dotenv';

dotenv.config();

const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    if (!token) {
      res.status(401).json({ 
        message: "unothorized you don 't have a token",
        success : false,
        resend : false
       });
      return;
    }

    // check if user have a token
    const decode: string | JwtPayload | null = jwt.decode(token);
    const { id: userId } = decode as JwtPayload & { id: string };
    const { rows: result } = await pool.query(
      `
        SELECT token FROM confirmation_token
        WHERE user_id=$1
        `,
      [+userId],
    );
    if (!result.length) {
      res.status(403).json({
        message: 'you are forbidden',
        success: false, // success used to redirect user to home page
        resend: false, // resend used to resend email if token expired
      });
      return;
    }

    // check the signature
    jwt.verify(token, process.env.JWT_SECRET as string);
    // valid the user
    const now = Date.now();
    const isoFormDate: string = new Date(now).toISOString();
    await pool.query(
      `
        UPDATE "user" 
        SET registration_date = $1
        WHERE id = $2
        `,
      [isoFormDate, +userId],
    );
    // remove his token
    await pool.query(
      `
      DELETE FROM confirmation_token
      WHERE user_id = $1
      `,
      [+userId],
    );
    res.status(200).json({
      message: 'confirm email with success',
      success: true,
      resend: false,
    });
    return;
  } catch (error: unknown) {
    if (error instanceof Error) {
      // case of token is invalid
      if (error.name === 'JsonWebTokenError')
        res.status(403).json({
          message: 'you are forbidden',
          success: false,
          resend: false,
        });
      // case of token is expired
      else if (error.name === 'TokenExpiredError')
        res.status(200).json({
          message: 'your token is expired',
          success: false,
          resend: true,
        });
      else {
        console.log(error);
        res.status(500).json({ message: 'internal error' });
      }
    }
  }
};

export default verifyToken;
