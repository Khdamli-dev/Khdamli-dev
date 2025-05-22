import { Request, Response } from 'express';
import pool from '../../database/dbConnection';
import dotenv from 'dotenv';
import { sendPrivateRequest } from './jobRequestEmitter';

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
    const publicRequest: string | undefined = process.env.PUBLIC_REQUEST_ID;
    const privateRequest: string | undefined = process.env.PRIVATE_REQUEST_ID;
    if (!publicRequest || !privateRequest) {
      throw new Error("envirement variable don't exist");
    }

    const { rows } = await pool.query(
      `
        UPDATE request
        SET worker = $1, type = $4
        WHERE (id = $2 AND type = $3)
        RETURNING *;
        `,
      [workerId, requestId, +publicRequest, +privateRequest],
    );

    // request don't exist
    if (!rows.length) {
      res.status(400).json({
        message: "request doesn't exist",
        success: false,
      });
      return;
    }

    // send to it to worker to make it real time
    await sendPrivateRequest(rows[0]);

    res.status(200).json({
      message: 'set worker in public request with success',
      success: true,
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
