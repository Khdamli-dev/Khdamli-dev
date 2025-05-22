import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const modifyComment = async (req: Request, res: Response) => {
  try {
    const requestId: number = parseInt(req.params.requestId);
    const { workerId, message } = req.body;
   
    if (isNaN(requestId) || isNaN(+workerId) || !message) {
      res.status(400).json({
        message: "missing request id or comment",
        success: false,
      });
      return;
    }
    const { rowCount } = await pool.query(
      `UPDATE public_request_messages SET message = $1
        WHERE request = $2 AND worker = $3`,
      [message, requestId, +workerId]
    );
    if (!rowCount) {
      res.status(404).json({
        message: "no matching request is found",
        success: false,
      });
      return;
    }
    res.status(200).json({
      message: "comment modified successfully",
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
export default modifyComment;
