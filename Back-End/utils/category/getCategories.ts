import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

const getCategories = async (req: Request, res: Response) => {
  try {
    const {rows : result} = await pool.query(`
        SELECT id, name, description, logo, parent_category
        FROM category`);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default getCategories;