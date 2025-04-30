import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

const createComment = async (req: Request, res: Response) => {
  const requestId: number = +req.params.requestId;
  let { workerId, comment }: { workerId: number; comment: string } = req.body;

  // check request id id and worker id
  if (Number.isNaN(requestId) || Number.isNaN(workerId) || !comment) {
    res.status(400).json({
      message: 'please provide request id and worker id',
      success: false,
    });
    return;
  }

  // check if comment is valid
  comment = comment.trim();
  if (comment.length > 100) {
    res.status(400).json({
      message: 'comment length should be more then 10 character and less then 100',
      success: false,
    });
    return;
  }

  // add comment into database
  try {
    await pool.query(`
        INSERT INTO public_request_messages(request, worker, message)
        values($1, $2, $3)
        `, [requestId, workerId, comment]);

    res.status(201).json({
        message : "add comment with success",
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

export default createComment;
