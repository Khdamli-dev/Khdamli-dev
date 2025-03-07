import { Request, Response, NextFunction } from 'express';
import JobRequest from '../interface/jobRequest';

const validateJobRequest = (req: Request, res: Response, next: NextFunction) => {
  const {
    client,
    client_address,
    working_time,
    category,
    payment,
    description,
    type,
    worker
  }: JobRequest = req.body;

  // Check for required fields
  if (!client || !client_address || !working_time || !category || !payment || !description || !type) {
    res.status(400).json({ 
      message: 'Missing required fields', 
      success : false   
    });
    return;
  }

  // Validation: type (1 or 2)
  if (type !== 1 && type !== 2) {
    res.status(400).json({ 
      message: 'Type must be 1 (Public) or 2 (Private)',
      success : false   
    });
    return;
  }

  // If the request is private (e.g., type === 2), ensure a worker is provided.
  if (type === 2 && !worker) {
    res.status(400).json({ 
      message: 'Worker ID is required for private requests',
      success : false 
    });
    return;
  }

  // validation : description length
  if (description.trim().length < 5 || description.trim().length > 3000) {
    res.status(400).json({ 
      message: 'Description must be at least 5 characters long and 3000 characters at most',
      success : false 
    });
    return;
  }
  
  next();
};

export default validateJobRequest;