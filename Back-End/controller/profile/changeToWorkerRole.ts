import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

const changeToWorkerRole = async (req: Request, res: Response) => {
  try {
    const userId : number = +req.params.id;
    if (Number.isNaN(userId)) {
      res.status(400).json({ message: 'user id is required' });
      return;
    }

    // check if user exist
    const { rows: existUser } = await pool.query(
      `
        SELECT role FROM "user"
        WHERE id=$1
        `,
      [userId],
    );
    if (!existUser.length) {
      res.status(403).json({ message: "user don 't exist" });
      return;
    }

    const role: number = 2;
    // check if he already have role
    if (role == existUser[0].role) {
      res.status(400).json({ message: 'you already have worker role' });
      return;
    }

    // update his role in user table
    await pool.query(
      `
        UPDATE "user"
        SET role=$1
        WHERE id=$2
        `,
      [role, userId],
    );

    // add this user to worker table
    const now = Date.now();
    const isoFormDate: string = new Date(now).toISOString();
    await pool.query(
      `
        INSERT INTO worker(id, registration_date, active, transport,
        sent_requests, accepted_requests, completed_requests, nbr_media)
        VALUES($1, $2, $3, $4, $5, $5, $5, $5)
        `,
      [userId, isoFormDate, true, false, 0],
    );

    res.status(201).json({ message: 'worker added' , success : true});
  } catch (error) {
    res.status(500).json({ message: 'internal error' });
  }
};

export default changeToWorkerRole;
