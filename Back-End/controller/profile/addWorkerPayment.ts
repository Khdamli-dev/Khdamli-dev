import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const addWorkerPayment = async (req: Request, res: Response) => {
  // Expecting the workerId and an array of payment method IDs
  const workerId : number = +req.params.workerId;
  const { payments }: { payments: number[] } = req.body;

  if (Number.isNaN(+workerId) || !payments.length) {
    res.status(400).json({ message: "Invalid worker ID or payments" });
    return;
  }

  try {
    // For each selected payment method, insert an entry in worker_payment
    // we use Promise.all to throw error for the first error in inserting
    await Promise.all(
      payments.map(async (paymentId: number) => {
        await pool.query(
          `INSERT INTO worker_payment (worker, payment)
           VALUES ($1, $2)
           `,
          [workerId, paymentId]
        );
      })
    );

    res.status(201).json({ message: "Payment methods added successfully" });
  } catch (error) {
    console.error("Error adding worker payment methods:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default addWorkerPayment;
