import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import pool from "../../database/dbConnection";
import dotenv from "dotenv";
import produceTokens from "../../utils/authentication/produceTokens";
import updatedEmail from "../../utils/validator/updatedEmail";

dotenv.config();

const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    if (!token) {
      res.status(401).json({
        message: "unothorized you don't have a token",
        success: false,
        resend: false,
      });
      return;
    }

    // check if user have a token
    // we need to search with token not id, to prevent confirm email that is updated and not confirmed, after that it also updated
    const { rows: result } = await pool.query(
      `
        SELECT user_id FROM confirmation_token
        WHERE token=$1
        `,
      [token]
    );
    if (!result.length) {
      res.status(403).json({
        message: "you are forbidden",
        success: false, // success used to redirect user to home page
        resend: false, // resend used to resend email if token expired
      });
      return;
    }

    const userId: number = result[0].user_id;
    // check the signature
    jwt.verify(token, process.env.JWT_SECRET as string);

    // validate the user if he is not valid (there is case when user want to update his email)
    const now = Date.now();
    const isoFormDate: string = new Date(now).toISOString();
    const { rows: user } = await pool.query(
      `
        UPDATE "user" 
        SET registration_date = COALESCE(registration_date, $1)
        WHERE id = $2 RETURNING role
        `,
      [isoFormDate, userId]
    );
    // i need to return user role because i will use it to make jwt tokens

    // update user email if this email is updated one
    await updatedEmail(userId);

    // remove his token
    await pool.query(
      `
      DELETE FROM confirmation_token
      WHERE user_id = $1
      `,
      [userId]
    );

    // produce tokens
    const {
      accessToken,
      refreshToken,
    }: { accessToken: string; refreshToken: string } = produceTokens(
      userId,
      user[0].role
    );

    res.status(200).json({
      message: "confirm email with success",
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      // case of token is invalid
      if (error.name === "JsonWebTokenError")
        res.status(403).json({
          message: "you are forbidden",
          success: false,
          resend: false,
        });
      // case of token is expired
      else if (error.name === "TokenExpiredError")
        res.status(200).json({
          message: "your token is expired",
          success: false,
          resend: true,
        });
      else {
        console.log(error);
        res.status(500).json({ message: "internal error" });
      }
    }
  }
};

export default verifyToken;
