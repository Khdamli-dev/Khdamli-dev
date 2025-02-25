import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const getCities = async (req: Request, res: Response) => {
  try {
    const { region } = req.query as { region?: string };
    if (!region) {
      res.status(400).json({ message: "region id is required" });
      return;
    }
    const { rows: regions } = await pool.query(
      `
        SELECT id, name from city
        where region=$1
        `,
      [region]
    );
    res.status(200).json({ cities: regions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal error" });
  }
};

export default getCities;
