import { NextFunction, Request, Response } from 'express';
import User from '../interface/user';
import checkUsername from '../utils/validator/checkUsername';
import checkEmail from '../utils/validator/checkEmail';
import checkPhoneNumber from '../utils/validator/checkPhoneNumber';
import checkPassword from '../utils/validator/checkPassword';

const checkInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, phoneNumber, password }: User = req.body;
    if (!username || !email || !phoneNumber || !password) {
      res
        .status(200)
        .json({
          message: 'username, email, phone number, password are required',
        });
      return;
    }
    // check if the info is already used
    const validUsername: boolean = await checkUsername(username);
    const validEmail: boolean = await checkEmail(email);
    const validPhoneNumber: boolean = await checkPhoneNumber(phoneNumber);
    const validPassword: boolean = checkPassword(password);
    const success = validUsername && validEmail && validPhoneNumber && validPassword;
    // if all info are valid jump to create account else we return errors of not valid info
    if (!success){
      res.status(400).json({
      success: success,
      username: validUsername,
      email: validEmail,
      phoneNumber: validPhoneNumber,
      password: validPassword,
      }); 
      return;
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'internal error' });
  }
};

export default checkInfo;
