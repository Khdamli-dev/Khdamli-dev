import pool from "../../database/dbConnection";
import Credentials from "../../interface/credentials";
import { Request, Response } from "express";
import encryptPassword from "../../utils/authentication/encryptPassword";
import { sendEmailConfirmationMail }from "../../utils/authentication/sendMail";

const createUser = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, email, password, username }: Credentials =
      req.body.credentials;
    const role = 1; // default role is client
    const hash: string = await encryptPassword(password);
    const { rows: result } = await pool.query(
      `
            INSERT INTO "user" (username , email , phone_number , password , role)
            VALUES ($1, $2, $3 , $4 , $5) RETURNING "id"
            `,
      [username, email, phoneNumber, hash, role]
    );

    // send confirmation email
    await sendEmailConfirmationMail(email , result[0].id);
    const {password : _, ...user} = result[0];
    res.status(201).json({
      message: "User added",
      user,
      success : true
    });
  } catch (error) {
    res.status(500).json({ message: "internal error" , success : false});
  }
};

export default createUser;
