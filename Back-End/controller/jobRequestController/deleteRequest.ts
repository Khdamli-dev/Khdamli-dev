import pool from "../../database/dbConnection";
import { Request , Response } from "express";

const deleteRequest = async (req : Request , res : Response) => {
    try {
        
        if (Number.isNaN(+req.params.requestId)){
          res.status(400).json({
          message: 'Please provide request id',
          success : false
          });
          return;
          }
          const requestId : number= +req.params.requestId;
        await pool.query(`DELETE FROM request WHERE id=$1`,[requestId]);
        res.status(200).json({ 
            message : "request deleted successfully",
            success : true
        })
    } catch (err) {
      res.status(500).json({
        message : "internal error",
        success : false
      })
    }
}
export default deleteRequest;
