import { Request, Response } from "express";
import PersonalInfo from "../../interface/personalInfo";
import Credentials from "../../interface/credentials";
import setPersonalInfo from "../../utils/update/setPersonalInfo";

const updateProfile = async (req: Request, res: Response) => {
    const {personalInfo, cerdentialInfo} : {personalInfo : PersonalInfo, cerdentialInfo : Credentials} 
        = req.body;
    if (personalInfo)
        await setPersonalInfo(req,res);
}

export default updateProfile;