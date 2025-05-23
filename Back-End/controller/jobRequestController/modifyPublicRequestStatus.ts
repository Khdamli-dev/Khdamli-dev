import { Request, Response } from 'express';
import pool from '../../database/dbConnection';
import { changeRequestStatus } from './jobRequestEmitter';

const modifyPublicRequestStatus = async (req: Request, res: Response) => {
  const requestId: number = +req.params.requestId;
  const status: number = +req.body.status;
  if (isNaN(requestId) || isNaN(status)) {
    res.status(400).json({
      message: 'Please provide request id and status',
      success: false,
    });
    return;
  }
  try {
    const acceptedRequestStatusId: string | undefined = process.env.ACCEPTED_REQUEST_ID;
    const rejectedRequestStatusId: string | undefined = process.env.REJECTED_REQUEST_ID;
    if (
      !acceptedRequestStatusId ||
      !rejectedRequestStatusId ||
      (status !== +acceptedRequestStatusId && status !== +rejectedRequestStatusId)
    ) {
      throw new Error('missing envirement variables, or invalid request status');
    }

    const query: string = status === +acceptedRequestStatusId ?
     `UPDATE request
      SET status = $2
      WHERE id = $1
      RETURNING *` : 
      `UPDATE request
      SET worker = NULL
      WHERE id = $1
      RETURNING *`;
    const values : Number[] = status === +acceptedRequestStatusId ?
     [requestId, status] : [requestId];

    const { rows } = await pool.query(query, values);

    // send the status to client to make it real time
    changeRequestStatus(rows[0]);

    res.status(200).json({
      message : "worker update request status of public request that he choosen on it",
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

export default modifyPublicRequestStatus;
