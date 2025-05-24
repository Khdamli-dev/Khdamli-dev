import { Request, Response } from "express";
import pool from "../../database/dbConnection";
// delete worker selected on request
const deleteWorker = async (req: Request, res: Response) => {
  try {
    const requestId: number = parseInt(req.params.requestId);
    const workerId: number = parseInt(req.params.workerId);
    if (isNaN(requestId) || isNaN(workerId)) {
      res.status(400).json({
        message: "Invalid request ID or worker ID",
        success: false,
      });
      return;
    }

    // First check if the worker is actually assigned to this request
    const checkWorker = await pool.query(
      `SELECT worker FROM request WHERE id = $1 AND worker = $2`,
      [requestId, workerId]
    );

    if (checkWorker.rowCount === 0) {
      res.status(404).json({
        message: "Worker not found for this request",
        success: false,
      });
      return;
    }

    // Update the request to remove the worker and set status back to "On Hold"
    const result = await pool.query(
      `UPDATE request 
       SET worker = NULL, 
           status = (SELECT id FROM request_status WHERE name = 'On Hold')
       WHERE id = $1 
       RETURNING *`,
      [requestId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        message: "Request not found",
        success: false,
      });
      return;
    }

    res.status(200).json({
      message: "Worker removed successfully",
      success: true,
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Error in deleteWorker:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export default deleteWorker;
