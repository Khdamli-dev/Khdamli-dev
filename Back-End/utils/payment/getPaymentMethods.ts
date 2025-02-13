import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const { rows: result } = await pool.query(`
      SELECT id, name 
      FROM payment_method
    `);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default getPaymentMethods;
