import { Request, Response } from 'express';
import pool from '../../database/dbConnection';
import JobRequest from '../../interface/jobRequest';
import jobRequestEmitter from './jobRequestEmitter';

const createRequest = async (req: Request, res: Response ) => {
  try {
    const {
      client,
      client_address,
      working_time,
      category,
      description,
      type,       // 1 for Public, 2 for Private
      worker      // Optional: only required if type is private
    } : JobRequest = req.body;

    // We set status to "On Hold" (assuming its id is 3 in request_status)
    const { rows } = await pool.query(`
      INSERT INTO "request" 
        (worker, client, client_address, working_time, category, description, type, status)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, 3)
      RETURNING *;
    `, [worker || null, client, client_address, working_time, category, description, type]);

    // send to it to workers to make it real time
    await jobRequestEmitter(rows[0]);
    res.status(201).json({
      message : 'Job request created successfully',
      request : rows[0], 
      success : true
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
