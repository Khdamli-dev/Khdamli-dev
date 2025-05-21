import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const deleteComment = async (req: Request, res: Response) => {
  try {
    const requestId: number = parseInt(req.params.requestId);
    const workerId: number = parseInt(req.body.workerId);
    if (isNaN(workerId) || isNaN(requestId)) {
      res.status(400).json({
        message: "missing request or worker id",
        success: false,
      });
      return;
    }
    const { rowCount } = await pool.query(
      `DELETE FROM public_request_messages WHERE request = $1 AND worker = $2`,
      [requestId, workerId]
    );
    if (!rowCount) {
      res.status(404).json({
        message: "No matching comment found",
        success: false,
      });
      return;
    }
    res.status(200).json({
      message: "Request deleted successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "internal error",
      success: false,
    });
    return;
  }
};
export default deleteComment;
