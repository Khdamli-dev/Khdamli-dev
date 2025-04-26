import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';

const checkRole = (allowedRoles : Number[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const accessTokenSecret: string | undefined = process.env.Access_Token_Secret;
        if (!accessTokenSecret) {
          res.status(500).json({
            message: 'internal error',
            success: false,
          });
          return;
        }
        const accessToken: string = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];
        // case of there is not token
        if (!accessToken) {
          res.status(403).json({
            message: 'you are forbidden, dont have access token',
            success: false,
          });
          return;
        }
      
        const userRole : number = (req as any).role;
        if (!allowedRoles.find(e => e == userRole)){
            res.status(401).json({
                message : "unothorized, you don't have the requirement role",
                success : false
            });
            return;
        }
        next();
    };
}

export default checkRole;
