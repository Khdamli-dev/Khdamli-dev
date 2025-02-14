import { Request, Response, NextFunction } from 'express';

const validateWorkingHours = (req: Request, res: Response, next: NextFunction) => {
  const { workingHours }: { workingHours: { day: number, begin: string, end: string }[] } = req.body;

  // Ensure workingHours is not empty
  if (workingHours.length === 0) {
    res.status(400).json({ message: 'Working hours must be a non-empty array' });
    return;
  }

  // Validate each working hour entry
  for (const { day, begin, end } of workingHours) {
    // Validate day (should be a valid integer between 1 and 7)
    if ( day < 1 || day > 7) {
    res.status(400).json({ message: 'Invalid day. Must be between 1 (Sunday) and 7 (Saturday)' });
    return;
    }

    // Validate begin and end time format (HH:mm)
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(begin) || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(end)) {
    res.status(400).json({ message: 'Invalid time format. Should be HH:mm' });
    return;
    }

    // Validate that begin time is earlier than end time
    if (begin >= end) {
    res.status(400).json({ message: 'Begin time must be earlier than end time' });
    return;
    }
  }

  next();
};

export default validateWorkingHours;
