import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

const setWorkingHours = async (req: Request, res: Response) => {
  const { workerId, workingHours }: { workerId: number, workingHours: { day: number, begin: string, end: string }[] } = req.body;

  if (!workerId || !workingHours.length) {
    res.status(400).json({ message: 'Invalid worker ID or no working hours provided' });
    return;
  }

  try {
    // Loop over each day and insert/update the working hours for the worker
    for (const { day, begin, end } of workingHours) {
      // Check if the worker has already set working hours for that day
      const existing = await pool.query(
        `SELECT * FROM time_work WHERE worker = $1 AND day = $2`,
        [workerId, day]
      );

      // If working hours exist, update them, otherwise, insert them
      if (existing.rows.length > 0) {
        await pool.query(
          `UPDATE time_work SET begin = $1, "end" = $2 WHERE worker = $3 AND day = $4`,
          [begin, end, workerId, day]
        );
      } else {
        await pool.query(
          `INSERT INTO time_work (worker, day, begin, "end") VALUES ($1, $2, $3, $4)`,
          [workerId, day, begin, end]
        );
      }
    }

    res.status(200).json({ message: 'Working hours updated successfully' });
  } catch (error) {
    console.error('Error updating working hours:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default setWorkingHours;
