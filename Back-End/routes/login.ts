import { Request, Response } from 'express';
import Credentials from '../interface/credentials';
import pool from '../database/dbConnection';
import authenticatePassword from '../utils/authentication/authenticatePassword';

const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: Credentials = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'email and password are required',
      });
      return;
    }

    // search user
    const { rows: user } = await pool.query(
      `
        SELECT id, password from "user"
        WHERE email=$1
        `,
      [email],
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
      password,
    );
    if (!validPassword) {
      res.status(403).json({
        success: false,
        message: 'password is wrong',
        validEmail: true,
        validPassword: false,
      });
      return;
    }

    // success login
    res.status(200).json({
        success: true,
        message: 'login with success',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({message : "internal error"});
  }
};

export default login;
