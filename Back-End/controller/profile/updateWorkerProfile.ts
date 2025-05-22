// controllers/updateWorkerInfo.ts
import { Request, Response } from "express";
import updateWorkerCategories from "../../utils/update/updateCategories";
import updateWorkingHours from "../../utils/update/updateWorkingHours";

const updateWorkerInfo = async (req: Request, res: Response) => {
  try {
    const workerId: number = +req.params.id;
    const { workingHours, categories }:
      { workingHours?: { day: number, begin: string, end: string }[], categories?: number[] } = req.body.workerInfo;

    if (!workingHours && !categories) {
      return res.status(400).json({ message: 'No worker info provided', success: false });
    }

    if (categories) {
      await updateWorkerCategories(workerId, categories);
    }

    if (workingHours) {
      await updateWorkingHours(workerId, workingHours);
    }
    res.status(200).json({ message: 'Worker info updated successfully', success: true });
  } catch (err) {
    console.error('Error updating worker info:', err);
    res.status(500).json({ message: 'Internal error', success: false });
  }
};

export default updateWorkerInfo;
