import { Request, Response } from "express";
import PersonalInfo from "../../interface/personalInfo";
import Credentials from "../../interface/credentials";
import setPersonalInfo from "../../utils/update/setPersonalInfo";
import updateCredentials from "../../utils/update/updateCredentials";
import validateInfo from "../../middleware/validateInfo";
import updateWorkerInfo from "./updateWorkerProfile";
import checkRole from "../../middleware/checkRole";
import dotenv from "dotenv";
import { workerInfo } from "../../interface/workerInfo";

dotenv.config();
const workerRoleId = Number(process.env.WORKER_ROLE_ID);

const updateProfile = async (req: Request, res: Response) => {
  const id: number = +req.params.id;
  const {
    personalInfo,
    credentials,
    workerInfo,
  }: {
    personalInfo: PersonalInfo;
    credentials: Credentials;
    workerInfo: workerInfo;
  } = req.body;

  if (Number.isNaN(id)) {
    res.status(400).json({ message: "user id is required" });
    return;
  }

  try {
    // Handle credentials validation and update
    if (credentials) {
      await new Promise<void>((resolve, reject) => {
        validateInfo(req, res, async () => {
          try {
            // Check if response was already sent by validateInfo
            if (res.headersSent) {
              reject(new Error('Validation failed'));
              return;
            }
            await updateCredentials(req, res);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
      
      if (res.headersSent) {
        return;
      }
    }

    if (personalInfo) {
      await setPersonalInfo(req, res);
      if (res.headersSent) {
        return;
      }
    }

    if (workerInfo) {
      await new Promise<void>((resolve, reject) => {
        const middleware = checkRole([workerRoleId]);
        middleware(req, res, async () => {
          try {
            if (res.headersSent) {
              reject(new Error('Role check failed'));
              return;
            }
            await updateWorkerInfo(req, res);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
      
      if (res.headersSent) {
        return;
      }
    }
    if (!res.headersSent) {
      res.status(200).json({
        message: 'updated successfully',
        success: true
      });
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ 
        message: "Internal server error",
        success: false 
      });
    }
  }
};

export default updateProfile;