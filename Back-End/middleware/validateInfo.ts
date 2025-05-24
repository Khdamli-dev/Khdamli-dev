import { NextFunction, Request, Response } from "express";
import Credentials from "../interface/credentials";
import checkUsername from "../utils/validator/checkUsername";
import checkEmail from "../utils/validator/checkEmail";
import checkPhoneNumber from "../utils/validator/checkPhoneNumber";
import checkPassword from "../utils/validator/checkPassword";

const validateInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, phoneNumber, password }: Credentials =
      req.body.credentials;

    // check if the info is already used
    // i make condition might be null because we will reuse middleware when update profile
    // if property exist we validate it else we give it true
    const validUsername: boolean = username
      ? await checkUsername(username)
      : true;
    const validEmail: boolean = email ? await checkEmail(email) : true;
    const validPhoneNumber: boolean = phoneNumber
      ? await checkPhoneNumber(phoneNumber)
      : true;
    const validPassword: boolean = password ? checkPassword(password) : true;
    const success =
      validUsername && validEmail && validPhoneNumber && validPassword;

    // if all info are valid jump to create account else we return errors of not valid info
    if (!success) {
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
    res.status(500).json({ message: "internal error" });
  }
};

export default validateInfo;
