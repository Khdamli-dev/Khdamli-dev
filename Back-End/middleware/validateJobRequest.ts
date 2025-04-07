import { Request, Response, NextFunction } from 'express';
import JobRequest from '../interface/jobRequest';
import assignAddress from './assignAddress';

const validateJobRequest = async (req: Request, res: Response, next: NextFunction) => {
  const {
    client,
    region,
    city,
    working_time,
    category,
    payment,
    description,
    type,
    worker,
  }: JobRequest = req.body;
  console.log(req.body);
  // Check for required fields
  if (!client || !region || !working_time || !category || !payment || !type) {
    res.status(400).json({ 
      message: 'Missing required fields', 
      success : false   
    });
    return;
  }

  // make address
  req.body.personalInfo = {};
  req.body.personalInfo.address = {region, city}
  await assignAddress(req, res, () => {
    req.body.client_address = req.body.personalInfo.address;
  });

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
  if (description){
    if (description.trim().length < 5 || description.trim().length > 3000) {
      res.status(400).json({ 
        message: 'Description must be at least 5 characters long and 3000 characters at most',
        success : false 
      });
      return;
    }
  }

  next();
};

export default validateJobRequest;