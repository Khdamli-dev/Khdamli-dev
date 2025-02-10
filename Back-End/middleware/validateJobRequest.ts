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
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  // If the request is private (e.g., type === 2), ensure a worker is provided.
  if (type === 2 && !worker) {
    res.status(400).json({ message: 'Worker ID is required for private requests' });
    return;
  }

  // validation : description length
  if (typeof description !== 'string' || description.trim().length < 5 || description.trim().length > 3000) {
    res.status(400).json({ message: 'Description must be at least 5 characters long and 3000 characters at most' });
    return;
  }

  // Validation: client, client_address, category, payment, type, worker (should be numbers)
  const numberFields = { client, client_address, category, payment, type };
  for (const field in numberFields) {
    const value = numberFields[field as keyof typeof numberFields];
    if (typeof value !== 'number' || isNaN(value) || !Number.isInteger(value)) { //check for NaN and if it's an integer
      res.status(400).json({ message: `${field} must be an integer number` });
      return;
    }
  }

  // Validation: working_time (should be a valid Date)
  const workingTimeDate = new Date(working_time);
  if (isNaN(workingTimeDate.getTime())) {
    res.status(400).json({ message: 'Invalid working_time format.  Should be a valid date string.' });
    return;
  }

    // Validation: type (1 or 2)
    if (type !== 1 && type !== 2) {
      res.status(400).json({ message: 'Type must be 1 (Public) or 2 (Private)' });
      return;
    }


  // Validation: worker (only required for private requests and should be a number)
  if (type === 2) {
    if (typeof worker !== 'number' || isNaN(worker) || !Number.isInteger(worker)) {
      res.status(400).json({ message: 'Worker ID must be an integer number for private requests' });
      return;
    }
  } else if (worker !== undefined && worker !== null) { // For public requests, worker should be null or undefined
      res.status(400).json({ message: 'Worker ID should not be provided for public requests' });
      return;
  }


  next();
};

export default validateJobRequest;