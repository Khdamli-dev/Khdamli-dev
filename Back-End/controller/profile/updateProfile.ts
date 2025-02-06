import { Request, Response } from "express";
import PersonalInfo from "../../interface/personalInfo";
import Credentials from "../../interface/credentials";
import setPersonalInfo from "../../utils/update/setPersonalInfo";
import checkInfo from "../../middleware/checkInfo";
import updateCredentials from "../../utils/update/updateCredentials";

const updateProfile = async (req: Request, res: Response) => {
    const {personalInfo, credentials} : {personalInfo : PersonalInfo, credentials : Credentials} 
        = req.body;
    if (personalInfo) {
        await checkInfo(req,res, ( ) => {});
        await setPersonalInfo(req,res);
}
   if (credentials) {
    await updateCredentials(req,res);
   }
}

export default updateProfile;