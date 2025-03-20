import { Request, Response } from "express";
import JobRequest from "../../interface/jobRequest";
import pool from "../../database/dbConnection";

export const updateRequestStatus = async (req : Request , res : Response) => {
    try {
        if (Number.isNaN(+req.params.requestId)){
          res.status(400).json({
          message: 'Please provide request id',
          success : false
          });
          return;
          }
        const requestId : number = +req.params.requestId;
        const status : number = +req.body.status;
      if ((status != 1 && status != 2) || Number.isNaN(+req.body.status)) {
        res.status(401).json({
            message : 'status is of wrong format',
            success : false
        });
        return;
      }
        const { rows } = await pool.query(
            `UPDATE request 
             SET status = $2 
             WHERE id = $1 
             RETURNING *;`,
            [requestId, status]
          );
          
          if (rows.length === 0) {
            res.status(404).json({ 
                message: "Request not found or unauthorized.",
                success : false
             });
             return;
          }
      res.status(201).json({
        message : 'status updated successfully',
        status : status === 1 ? 'Accepted' : 'Rejected',
        success : true
      })
    } catch (error){
        res.status(500).json({
            message : 'internal error',
            success : false,
            error
        })
        console.log(error)
        return;
    }
}
