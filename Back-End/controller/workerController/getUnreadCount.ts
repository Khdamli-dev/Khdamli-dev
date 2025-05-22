import { Request, Response } from 'express';
import pool from '../../database/dbConnection';
import dotenv from 'dotenv';

dotenv.config();

const getUnreadCount = async (req: Request, res: Response) => {
  const worker: number = parseInt(req.params.worker);
  if (isNaN(worker)) {
    res.status(400).json({
        message: 'Invalid or missing worker ID',
        success: false,
    });
    return;
  }

  try {
    // get worker unread private requests
    const privateRequestId : string | undefined = process.env.PRIVATE_REQUEST_ID;
    const onHoldRequestId : string | undefined = process.env.ON_HOLD_REQUEST_ID;
    if (!privateRequestId || !onHoldRequestId){
      throw new Error("missing envirement variables");
    }

    const { rows } = await pool.query(`
        SELECT COUNT(*) AS count
        FROM request
        WHERE (worker = $1 AND type = $2 AND status = $3)
        `, [worker, +privateRequestId, +onHoldRequestId]);

    res.status(200).json({
        message : "select on hold private request for worker with success",
        success : true,
        count : rows.length ? parseInt(rows[0].count, 10) : 0
    });
  } catch (error) {
    console.error("Error fetching on hold private request for worker, ", error);
    res.status(500).json({ 
        message: "Internal server error", 
        success : false
    });
  }
};

export default getUnreadCount;
