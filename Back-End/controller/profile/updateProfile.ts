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
    const id : number = +req.params.id;
    const {personalInfo, credentials , workerInfo} : { personalInfo : PersonalInfo, credentials : Credentials , workerInfo : workerInfo} = req.body;

    if (Number.isNaN(id)) {
       res.status(400).json({ message: 'user id is required' });
       return;
    }
    // in credentials first validating data before update it
    if (credentials){
        validateInfo(req,res, async () => {
            await updateCredentials(req,res); 
        });
    }     
    if (personalInfo){
        await setPersonalInfo(req,res);
    } 
   if (workerInfo) {
    const middleware = checkRole([workerRoleId]);
    middleware(req, res, () => updateWorkerInfo(req, res));
}
}

export default updateProfile;