import pool from "../../database/dbConnection";
import Credentials from "../../interface/credentials";
import { Request, Response } from "express";
import confirmationEmail from "./confirmationEmail";
import encryptPassword from "../../utils/authentication/encryptPassword";

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
    await confirmationEmail(result[0].id, email);
    res.status(201).json({
      message: "User added",
      userId: result[0].id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal error" });
  }
};

export default createUser;
