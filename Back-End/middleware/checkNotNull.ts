import { NextFunction, Request, Response } from "express";
import Credentials from "../interface/credentials";

// the function is used to check if all info is not null when create a user
const checkNotNull = (req: Request, res: Response, next: NextFunction) => {
  const { username, email, phoneNumber, password }: Credentials =
    req.body.credentials;
  if (!username || !email || !phoneNumber || !password) {
    res.status(400).json({
      message: "username, email, phone number, password, role are required",
    });
    return;
  }
  next();
};

export default checkNotNull;
