import { Request, Response } from 'express';
import pool from '../../database/dbConnection';
import JobRequest from '../../interface/jobRequest';

const createRequest = async (req: Request, res: Response) => {
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

    // For public requests, worker should be null.
    // For private requests (type = 2), worker must be provided.
    const assignedWorker = type === 2 ? worker : null;

    // Insert into the request table.
    // Note: sent_time is set automatically via default.
    // We set status to "On Hold" (assuming its id is 3 in request_status)
    const query = `
      INSERT INTO "request" 
        (worker, client, client_address, working_time, category, payment, description, type, status)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, 3)
      RETURNING *;
    `;
    const values = [
      assignedWorker,
      client,
      client_address,
      working_time,
      category,
      payment,
      description,
      type
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json({
      message: 'Job request created successfully',
      request: rows[0].id
    });
  } catch (error) {
    console.error('Error creating job request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default createRequest;
