import { Request, Response } from 'express';
import pool from '../../database/dbConnection';
import dotenv from 'dotenv';

dotenv.config();

const selectWorker = async (req: Request, res: Response) => {
  const requestId: number = +req.params.requestId;
  const workerId: number = +req.params.workerId;

  if (Number.isNaN(requestId) || Number.isNaN(workerId)) {
    res.status(400).json({
      message: 'please provide request id and worker id',
      success: false,
    });
    return;
  }

  try {
    console.log(process.env.PUBLIC_REQUEST_ID);
    const { rowCount } = await pool.query(
      `
        UPDATE request
        SET worker = $1
        WHERE (id = $2 AND type = $3)
        `,
      [workerId, requestId, process.env.PUBLIC_REQUEST_ID],
    );

    // request don't exist
    if (!rowCount) {
      res.status(400).json({
        message: "request doesn't exist",
        success: false,
      });
      return;
    }

    res.status(200).json({
        message : "set worker in public request with success",
        success : true
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'internal error',
      success: false,
    });
  }
};

export default selectWorker;
