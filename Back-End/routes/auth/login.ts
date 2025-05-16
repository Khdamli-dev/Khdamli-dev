import { Request, Response } from "express";
import Credentials from "../../interface/credentials";
import pool from "../../database/dbConnection";
import authenticatePassword from "../../utils/authentication/authenticatePassword";
import dotenv from "dotenv";
import produceTokens from "../../utils/authentication/produceTokens";


dotenv.config();

const login = async (req: Request, res: Response) => {
  try {
   
    const { email, password }: Credentials = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "email and password are required",
      });
      return;
    }

    // search user
    const { rows: user } = await pool.query(
      `
        SELECT * from "user"
        WHERE email=$1
        `,
      [email]
    );
    if (!user.length) {
      res.status(403).json({
        success: false,
        message: "user don 't exist",
        validEmail: false,
      });
      return;
    }

    // validate password
    const validPassword = await authenticatePassword(
      user[0].password,
      password
    );
    if (!validPassword) {
      res.status(403).json({
        success: false,
        message: "password is wrong",
        validEmail: true,
        validPassword: false
      });
      return;
    }

    // check if account is valid
    // if (!user[0].registration_date) {
    //   res.status(403).json({
    //     success: false,
    //     message: "Email not verified. Please confirm your email to log in.",
    //     id : user[0].id,
    //     validEmail: true,
    //     validAccount: false,
    //   });
    //   return;
    // }
    // produce jwt tokens
    const { accessToken, refreshToken } = produceTokens(
      user[0].id,
      user[0].role
    );

    const {password : _, ...returnedUser} = user[0];
    console.log(returnedUser)
    // success login
    res.status(200).json({
      verified : returnedUser[0]?.registration_date == null ? false:true,
      success: true,
      message: "login with success",
      accessToken,
      refreshToken,
      user : returnedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal error" });
  }
};

export default login;
