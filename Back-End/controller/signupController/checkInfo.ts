import { Request, Response } from "express";
import User from "../../interface/user";
import checkUsername from "../../utils/validator/checkUsername";
import checkEmail from "../../utils/validator/checkEmail";
import checkPhoneNumber from "../../utils/validator/checkPhoneNumber";

const checkInfo = async (req : Request, res : Response) => {
    try {
    const {username, email, phoneNumber}: User = req.body;
    if (!username || !email || !phoneNumber){
       res.status(200).json({message : "username email and phone number are required"}); 
       return;
    }
    // check if the info is already used
    const validUsername : boolean = await checkUsername(username);
    const validEmail : boolean = await checkEmail(email);
    const validPhoneNumber : boolean = await checkPhoneNumber(phoneNumber);
    const success = validUsername && validEmail && validPhoneNumber;
    const status = success ? 200 : 400;
    res.status(status).json({
        success : success,
        username : validUsername,
        email : validEmail,
        phoneNumber : validPhoneNumber
    });
    } catch (error) {
        console.log(error);
        res.status(500).json({message : 'internal error'});
    }
}

export default checkInfo;