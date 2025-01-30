import { Request, Response } from "express";
import User from "../../interface/user";
import pool from "../../database/dbConnection";

const checkInfo = async (req : Request, res : Response) => {
    try {
    const {username, email, phoneNumber}: User = req.body;
    if (!username || !email || !phoneNumber){
       res.status(200).json({message : "username email and phone number are required"}); 
       return;
    }
    // check if the info is already used
    const {rows : existUsername} = await pool.query(`
        SELECT id from "user"
        where username=$1
        `,[username]);
    const {rows : existEmail} = await pool.query(`
        SELECT id from "user" 
        where email=$1
        `,[email]);
    const {rows : existPhoneNumber} = await pool.query(`
        SELECT id from "user"
        where phone_number=$1
        `,[phoneNumber]);
    const success = !existUsername.length && !existEmail.length && !existPhoneNumber.length;
    const status = success ? 200 : 400;
    res.status(status).json({
        success : success,
        username : !existUsername.length,
        email : !existEmail.length,
        phoneNumber : !existPhoneNumber.length
    });
    } catch (error) {
        console.log(error);
        res.status(500).json({message : 'internal error'});
        return;
    }
}

export default checkInfo;