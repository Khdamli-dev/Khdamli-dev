import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

const addWorkerCategory = async (req: Request, res: Response) => {
  const workerId : number = +req.params.workerId;
  const { categories } : {categories : number[]} = req.body;
 

  if (Number.isNaN(workerId) || !categories.length) {
    res.status(400).json({ message: 'Invalid worker ID or categories' });
    return;
  }

  try {
    // we use Promise.all to throw error for the first error in inserting
    await Promise.all(
      categories.map(async (categoryId : number) => {
        await pool.query(
          `INSERT INTO worker_category (worker, category , unity) 
          VALUES ($1, $2 , $3) 
          `,[workerId, categoryId ,1]);
      })
    );

    res.status(201).json({ message: 'Categories added successfully' });
  } catch (error) {
    console.error('Error adding worker categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default addWorkerCategory;
