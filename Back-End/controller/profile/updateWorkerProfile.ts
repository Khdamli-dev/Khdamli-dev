// controllers/updateWorkerInfo.ts
import { Request, Response } from "express";
import updateWorkerCategories from "../../utils/update/updateCategories";
import updateWorkingHours from "../../utils/update/updateWorkingHours";
import pool from "../../database/dbConnection";

const updateWorkerInfo = async (req: Request, res: Response) => {
  try {
    const workerId: number = +req.params.id;
    const {
      workingHours,
      categories,
      bio,
    }: {
      workingHours?: { day: number; begin: string; end: string }[];
      categories?: number[];
      bio?: string;
    } = req.body.workerInfo;

    if (!workingHours && !categories) {
      return;
    }

    if (categories) {
      await updateWorkerCategories(workerId, categories);
    }

    if (workingHours) {
      await updateWorkingHours(workerId, workingHours);
    }
    if (bio) {
      // Assuming you have a function to update the bio in the database
      await pool.query(`UPDATE worker SET bio = $1 WHERE id=$2`, [
        bio,
        workerId,
      ]);
    }
  } catch (err) {
    console.error("Error updating worker info:", err);
    res.status(500).json({ message: "Internal error", success: false });
  }
};

export default updateWorkerInfo;
