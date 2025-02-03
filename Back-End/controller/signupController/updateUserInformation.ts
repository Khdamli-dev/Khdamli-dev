import pool from "../../database/dbConnection";
import User from "../../interface/user";
import { Request, Response } from 'express';

const updateUserInformation = async (req: Request, res: Response)  =>{
  try {
    const { id, sex, age, profileImage, address }: User = req.body;
    if (!id) {
      res.status(400).json({ message: "User id is required" });
      return;
    }
    const query = `UPDATE "user"
      SET sex = $1, age = $2, profile_image = $3, address = $4
      WHERE id = $5;`;
    const values = [sex || null, age || null, profileImage || null, address || null, id];
    await pool.query(query, values);
    res.status(200).json({ message: 'User information updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default updateUserInformation;
