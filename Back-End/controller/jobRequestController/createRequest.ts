import { NextFunction, Request, Response } from 'express';
import pool from '../../database/dbConnection';
import JobRequest from '../../interface/jobRequest';

const createRequest = async (req: Request, res: Response , next : NextFunction) => {
  try {
    const {
      client,
      client_address,
      working_time,
      category,
      payment,
      description,
      type,       // 1 for Public, 2 for Private
      worker      // Optional: only required if type is private
    } : JobRequest = req.body;

    // We set status to "On Hold" (assuming its id is 3 in request_status)
    const { rows } = await pool.query(`
      INSERT INTO "request" 
        (worker, client, client_address, working_time, category, payment, description, type, status)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, 3)
      RETURNING *;
    `, [worker, client, client_address, working_time, category, payment, description, type]);
    res.status(201).json({
      message : 'Job request created successfully',
      success : true ,
      reqestId : rows[0].id
    });
    
  } catch (error) {
    console.error('Error creating job request:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      requestId : null,
      success : false
    });
    return;
  }
};

export default createRequest;
