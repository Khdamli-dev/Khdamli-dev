import { Request, Response } from "express";
import PersonalInfo from "../../interface/personalInfo";
import Credentials from "../../interface/credentials";
import setPersonalInfo from "../../utils/update/setPersonalInfo";
import updateCredentials from "../../utils/update/updateCredentials";
import assignAddress from "../../middleware/assignAddress";

const updateProfile = async (req: Request, res: Response) => {
    const {personalInfo, credentials} : {personalInfo : PersonalInfo, credentials : Credentials} 
        = req.body;
    if (credentials) {
        await updateCredentials(req,res);
}
   if (personalInfo) {
    await setPersonalInfo(req,res);
   }
}

export default updateProfile;