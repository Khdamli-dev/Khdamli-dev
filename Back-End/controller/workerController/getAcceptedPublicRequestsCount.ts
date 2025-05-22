import { Request, Response } from 'express';
import dotenv from 'dotenv';
import pool from '../../database/dbConnection';

dotenv.config();

const getAccesptedPublicRequestsCount = async (req: Request, res: Response) => {
  try {
    const workerId: number = parseInt(req.params.worker);
    if (isNaN(workerId)) {
      res.status(400).json({
        message: 'Invalid or missing worker ID',
        success: false,
      });
      return;
    }

    const publicRequestId: string | undefined = process.env.PUBLIC_REQUEST_ID;
    const onHoldRequestId: string | undefined = process.env.ON_HOLD_REQUEST_ID;
    if (!publicRequestId || !onHoldRequestId) {
      throw new Error('missing envirement variables');
    }

    const { rows } = await pool.query(
      `
        SELECT COUNT(*) AS count
        FROM request
        WHERE (worker = $1 AND type = $2 AND status = $3)
        `,
      [workerId, +publicRequestId, +onHoldRequestId],
    );

    res.status(200).json({
      message: 'select on hold public request for worker with success',
      success: true,
      count: rows.length ? parseInt(rows[0].count, 10) : 0,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'internal error',
      success: false,
    });
  }
};

export default getAccesptedPublicRequestsCount;
