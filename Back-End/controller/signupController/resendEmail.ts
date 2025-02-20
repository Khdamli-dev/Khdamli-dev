import { Request, Response } from "express";
import confirmationEmail from "./confirmationEmail";

const resendEmail = async (req: Request, res : Response) => {
    try {
    const {userId, email} : {userId : number, email : string} = req.body;
    await confirmationEmail(userId,email);
    res.status(200).json({message : "resend email with success"});   
    } catch (error) {
      console.log(error); 
      res.status(500).json({ message: 'internal error' }); 
    }
}

export default resendEmail;