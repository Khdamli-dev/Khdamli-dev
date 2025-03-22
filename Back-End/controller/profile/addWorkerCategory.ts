import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

const addWorkerCategory = async (req: Request, res: Response) => {
  const { workerId, categories } : {workerId : number, categories : number[]} 
  = req.body;

  if (!workerId || !categories.length) {
    res.status(400).json({ message: 'Invalid worker ID or categories' });
    return;
  }

  try {
    categories.map(async (categoryId : number) => {
      await pool.query(
        `INSERT INTO worker_category (worker, category , unity) 
         VALUES ($1, $2 , 1) 
         `,[workerId, categoryId]);
    });
  

    res.status(201).json({ message: 'Categories added successfully' });
  } catch (error) {
    console.error('Error adding worker categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default addWorkerCategory;
