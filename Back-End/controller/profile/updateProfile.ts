import { Request, Response } from "express";
import PersonalInfo from "../../interface/personalInfo";
import Credentials from "../../interface/credentials";
import setPersonalInfo from "../../utils/update/setPersonalInfo";
import updateCredentials from "../../utils/update/updateCredentials";
import validateInfo from "../../middleware/validateInfo";

const updateProfile = async (req: Request, res: Response) => {
    const {id, personalInfo, credentials} : {id : number ,
        personalInfo : PersonalInfo, credentials : Credentials} 
        = req.body;
    if (!id) {
    res.status(400).json({ message: 'id is required' });
    return;
    }
    // in credentials first validating data before update it
    if (credentials){
        validateInfo(req,res, async () => {
            await updateCredentials(req,res);
        });
    }     
    if (personalInfo)
        await setPersonalInfo(req,res);
}

export default updateProfile;