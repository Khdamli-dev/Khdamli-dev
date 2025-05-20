import { Request, Response } from "express";
import pool from "../../database/dbConnection";

export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    if (Number.isNaN(+req.params.requestId) || isNaN(+req.body.status)) {
      res.status(400).json({
        message: "Please provide request id and status",
        success: false,
      });
      return;
    }
    const requestId: number = +req.params.requestId;
    const status: number = +req.body.status;
<<<<<<< HEAD
    if (status < 1 || status > 6 || Number.isNaN(+req.body.status)) {
=======
    if ((status < 1 && status > 4) || Number.isNaN(+req.body.status)) {
>>>>>>> origin/main
      res.status(401).json({
        message: "status is of wrong format",
        success: false,
      });
      return;
    }

<<<<<<< HEAD
    let query, values;

    if (status === 1 && req.body.public && req.body.workerId) {
      // For accepting a worker - status 1
      query = `UPDATE request  
               SET status = $2,
                   type = 2,
                   worker = $3  
               WHERE id = $1 
               RETURNING *;`;
      values = [requestId, status, +req.body.workerId];
    } else {
      // For other status updates
      query = `UPDATE request 
               SET status = $2 
               WHERE id = $1 
               RETURNING *;`;
      values = [requestId, status];
    }

    const { rows } = await pool.query(query, values);
=======
    const { rows } = await pool.query(
      `UPDATE request 
      SET status = $2 
      WHERE id = $1 
      RETURNING *;`,
      [requestId, status],
    );
>>>>>>> origin/main

    if (rows.length === 0) {
      res.status(404).json({
        message: "Request not found or unauthorized.",
        success: false,
      });
      return;
    }
    res.status(201).json({
      message: "status updated successfully",
      status,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal error",
      success: false,
      error,
    });
  }
};
