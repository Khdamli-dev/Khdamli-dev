import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {

  const accessTokenSecret: string | undefined = process.env.Access_Token_Secret;
  if (!accessTokenSecret) {
    res.status(500).json({
      message: 'internal error',
      success: false,
    });
    return;
  }

  const accessToken: string = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];

  // case of Session expired
  if (!accessToken) {
    res.status(403).json({
      message: 'you are forbidden, dont have access token',
      success: false,
    });
    return;
  }

  // check if access token is valid
  jwt.verify(accessToken, accessTokenSecret, (err, decode) => {
    if (err) {
      if (err.name == 'TokenExpiredError'){
        res.status(401).json({
          message: 'Session expired. Please log in again.',
          success: false,
        });
        return;
      } else {
        res.status(403).json({
          message: 'you are forbidden, fake access token',
          success: false,
        });
        return;
      } 
    }
    next();
  });
};

export default verifyJWT;
