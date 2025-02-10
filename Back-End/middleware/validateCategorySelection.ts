import { Request, Response, NextFunction } from 'express';

const validateCategorySelection = (req: Request, res: Response, next: NextFunction) => {
  const { categories } : {categories : number[]} = req.body;

  if (!Array.isArray(categories) || categories.length === 0) {
    res.status(400).json({ message: 'Categories must be a non-empty array' });
    return;
  }

  for (const category of categories) {
    if (
      typeof category !== 'number' 
    ) {
      res.status(400).json({ message: 'Invalid category data' });
      return;
    }
  }

  next();
};

export default validateCategorySelection;