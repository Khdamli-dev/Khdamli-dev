import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const getRegions = async (req: Request, res: Response) => {
  try {
    const { country } = req.query as { country?: string };
    if (!country) {
      res.status(400).json({ message: "country id is required" });
      return;
    }
    const { rows: regions } = await pool.query(
      `
        SELECT id, name from region
        where country=$1
        `,
      [+country]
    );
    res.status(200).json({ regions: regions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal error" });
  }
};

export default getRegions;
