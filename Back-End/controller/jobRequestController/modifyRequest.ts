import { Request, Response } from 'express';
import pool from '../../database/dbConnection';
import JobRequest from '../../interface/jobRequest';

const modifyRequest = async (req: Request, res: Response) => {
  try {
    if (Number.isNaN(+req.params.requestId)){
      res.status(400).json({
      message: 'Please provide request id',
      success : false
      });
      return;
      }
    const requestId = +req.params.requestId;
    const{
      client_address,
      working_time,
      category,
      description,
    } : JobRequest = req.body;
    let query = 'UPDATE request SET ';
    let params = [];
    let counter = 1;
    if (client_address) {
        query += ` client_address = $${counter++},`;
        params.push(client_address);
    };
    if (working_time) {
        query += ` working_time = $${counter++},`;
        params.push(working_time);
    };
    if (category) {
        query += ` category = $${counter++},`;
        params.push(category);
    };
    if (description) {
        query += ` description = $${counter++},`;
        params.push(description);
    };
    if (params.length){
        // delete the last , if there is at leat one updated value
        query = query.slice(0,-1);
        query += ` WHERE id = $${counter}`;
        params.push(requestId);
        const { rowCount } = await pool.query(query, params);
        if (rowCount === 0) {
            res.status(400).json({
                 message: "request doesn't exist",
                 success : false
            });
            return;
        };
      res.status(201).json({
        message : 'Job request updated successfully',
        requestId,
        success : true
      })         
    }
} catch (error) {
    console.error('Error modifying job request:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      success : false
    });
    return;
} 
};
export default modifyRequest;