import { Request, Response, NextFunction } from "express";

const validatePaymentSelection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { payments }: { payments: number[] } = req.body;

  // Ensure payments is a non-empty array
  if (payments.length === 0) {
    res.status(400).json({ message: "Payments must be a non-empty array" });
    return;
  }

  // Verify each element is a number
  for (const payment of payments) {
    if (typeof payment !== "number") {
      res.status(400).json({ message: "Invalid payment data" });
      return;
    }
  }

  next();
};

export default validatePaymentSelection;
