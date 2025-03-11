import { Request, Response } from "express";
import JobRequest from "../../interface/jobRequest";
import pool from "../../database/dbConnection";

export const updateRequestStatus = async (req : Request , res : Response) => {
    try {
        const requestId : number = +req.params.requestId;
        const status = (req.body.status === 'Accepted' || req.body.status === 'Rejected') ? 
      (req.body.status === 'Accepted' ? 1 : 2) : null; 
      if (status === null) {
        res.status(401).json({
            message : 'decision is of wrong format',
            success : false
        });
        return;
      }
        const {worker} : JobRequest = req.body;
        const { rows } = await pool.query(
            `UPDATE request 
             SET status = $3 
             WHERE id = $1 AND worker = $2 
             RETURNING *;`,
            [requestId, worker, status]
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