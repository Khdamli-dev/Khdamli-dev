import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

const setWorkingHours = async (req: Request, res: Response) => {
  const workerId : number = +req.params.workerId;
  const { workingHours }: { workingHours: { day: number, begin: string, end: string }[] } = req.body;

  if (Number.isNaN(+workerId) || !workingHours.length) {
    res.status(400).json({ message: 'Invalid worker ID or no working hours provided' });
    return;
  }

  try {
    // Loop over each day and insert/update the working hours for the worker
    await Promise.all(
      workingHours.map(({day, begin, end} : {day : number, begin : string, end : string}) => {
        pool.query(`
          INSERT INTO time_work(worker, day, "begin", "end")
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (worker, day) 
          DO UPDATE SET "begin" = EXCLUDED."begin", "end" = EXCLUDED."end";
          `, [workerId, day, begin, end]);
      })
    );

    res.status(200).json({ message: 'Working hours updated successfully' });
  } catch (error) {
    console.error('Error updating working hours:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default setWorkingHours;
