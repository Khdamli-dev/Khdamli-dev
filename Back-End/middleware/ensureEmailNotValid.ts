import { NextFunction, Request, Response } from "express";
import pool from "../database/dbConnection";

const ensureEmailNotValid = async (req : Request, res : Response, next : NextFunction) => {
    try {
    const {userId, email} : {userId : number, email : string} = req.body;
    if (!userId || !email){
      res.status(400).json({message : "userId and email are required"});
      return;
    }

    const {rows : user} = await pool.query(`
        SELECT registration_date, email FROM "user"
        WHERE id=$1
        `, [userId]);
    if (!user.length){
      res.status(403).json({message : "user don 't exist"});
      return;
    }

    // go to resend email if user is new(signup)
    if (!user[0].registration_date && email === user[0].email){
        next();
        return;
    } 
    
    // if resend email is of updated email
    const {rows : secondUser} = await pool.query(`
        SELECT email FROM updated_email
        WHERE user_id=$1
        `, [userId]);
    if (!secondUser.length){
        if (user[0].registration_date && email === user[0].email){ 
            // case of alrady confirmed email
           res.status(400).json({message : "you already confirm you email"});
           return; 
        }
        else{  // case of fake email
            res.status(403).json({message : "email don 't used by the user"});
            return;
        }
    }
    if (email === secondUser[0].email){
       next(); 
       return;
    }
    // case of fake email
    res.status(403).json({message : "email don 't used by the user"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'internal error' });
    }
}

export default ensureEmailNotValid;