import pool from "../../database/dbConnection";
import User from "../../interface/user";
import { Request, Response } from 'express';
const createUser = async (req: Request, res: Response) => {

        try {
            const { phoneNumber, email , password , username , role }: User = req.body;
            const date = new Date();
            const registrationDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            await pool.query(`INSERT INTO "user" ( username , email , phone_number , password , role , registration_date)
                VALUES ($1, $2, $3 , $4 , $5 , $6)`,
                [ username , email , phoneNumber , password , role , registrationDate ],
            );
            res.status(200).json({ message: 'User added' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'internal error' });
        }
    }


export default createUser;