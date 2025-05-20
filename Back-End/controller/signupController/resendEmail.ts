import { Request, Response } from "express";
import { sendEmailConfirmationMail} from "../../utils/authentication/sendMail";
import { ChildProcess } from "child_process";

export const resendEmail = async (req: Request, res: Response) => {
  try {
    const  userId = +req.params.userId; 
    const { email} = req.body.credentials;
    await sendEmailConfirmationMail(email , userId);
    res.json({
      message: 'OTP sent successfully',
      success : true,
      userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Internal server error',
      success : false,
      userId : null
    });
  }
};
export default resendEmail;