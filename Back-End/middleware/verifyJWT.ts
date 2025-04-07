import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken : string =
    req.cookies?.accessToken || 
    req.headers['authorization']?.split(' ')[1];

    const refreshHeader = req.headers['x-refresh-token'] as string;
    const refreshToken : string = 
    req.cookies?.refreshToken || 
    refreshHeader?.split(' ')[1];

  // case of Session expired
  if (!accessToken && !refreshToken) {
    res.status(401).json({
      message: 'Session expired. Please log in again.',
      success: false,
    });
    return;
  }

  // i need to add case of just access token expired (by call refreshAccessToken function)

  // check if access token is valid
  const accessTokenSecret: string | undefined = process.env.Access_Token_Secret;
  if (!accessTokenSecret) {
    res.status(500).json({
      message: 'internal error',
      success: false,
    });
    return;
  }
  jwt.verify(accessToken, accessTokenSecret, (err, decode) => {
    if (err) {
      res.status(403).json({
        message: 'you are forbidden',
        success: false,
      });
      return;
    }
    next();
  });
};

export default verifyJWT;
