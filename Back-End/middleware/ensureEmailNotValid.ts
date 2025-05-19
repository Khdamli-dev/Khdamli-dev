import { NextFunction, Request, Response } from "express";
import pool from "../database/dbConnection";

const ensureEmailNotValid = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const userId = +req.params.userId;
    const {email} : { email : string} = req.body.credentials;
    if (!email || isNaN(userId) || !userId) {
        res.status(400).json({ 
            message: 'Email and User id are required', 
            success: false,
            userId : null 
          });
        return;
      }
    const {rows : user} = await pool.query(`
        SELECT registration_date, email FROM "user"
        WHERE id=$1
        `, [userId]);
    if (!user.length){
      res.status(403).json({
        message : "user don't exist",
        success : false
       });
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
           res.status(400).json({
            message : "you already confirm you email",
            success : false
           });
           return; 
        }
        else{  // case of fake email
            res.status(403).json({
                message : "email don 't used by the user",
                success : false
            });
            return;
        }
    }
    // see if this email is latest updated email
    if (email === secondUser[0].email){
       next(); 
       return;
    }
    // fake email, or user want to confirm email that he choose it but don 't confirm it and after that he choose another updated email
    res.status(403).json({
        message : "email don 't used by the user",
        success : false
    });
    } catch (error) {
        res.status(500).json({ message: 'internal error' });
    }
}

export default ensureEmailNotValid;