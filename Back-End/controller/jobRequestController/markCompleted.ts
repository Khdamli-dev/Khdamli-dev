import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const markCompleted = async (req: Request, res: Response) => {
    try {
  const requestId = +req.params.requestId;
  const { workerId, clientId, review, rating } = req.body;
  if (isNaN(requestId) || isNaN(+clientId) || isNaN(+workerId)) {
    res.status(400).json({
      message: "missing requestId , workerId or clientId",
      success: false,
    });
    return;
  }
  const {rowCount}= await pool.query(
    `UPDATE request
SET status = 4
WHERE id = $1 
AND worker =$2
AND client =$3 
AND status =1`,
    [requestId, +workerId, +clientId]
  );
  if (!rowCount){
    res.status(404).json({
        message : 'no matching request is found',
        success : false
    });
    return;
  }
  if (review || !isNaN(+rating)) {
    await pool.query(
      `INSERT INTO review 
            (client_id , worker_id , id , review , rating) VALUES
             ($1 , $2 , $3 , $4 , $5)`,
      [+clientId , +workerId , requestId , review ,+rating ]
    );
  };
  res.status(200).json({
    message : 'request marked complete',
    success : true, 
  });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message : 'internal error',
            success : false
        });
        return;
    }
};
export default markCompleted;
