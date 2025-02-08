import { Request, Response } from "express";
import PersonalInfo from "../../interface/personalInfo";
import Credentials from "../../interface/credentials";
import setPersonalInfo from "../../utils/update/setPersonalInfo";
import updateCredentials from "../../utils/update/updateCredentials";

const updateProfile = async (req: Request, res: Response) => {
    const {id, personalInfo, credentials} : {id : number ,
        personalInfo : PersonalInfo, credentials : Credentials} 
        = req.body;
    if (!id) {
    res.status(400).json({ message: 'id is required' });
    return;
    }
    if (credentials)
        await updateCredentials(req,res);
    if (personalInfo)
        await setPersonalInfo(req,res);
}

export default updateProfile;