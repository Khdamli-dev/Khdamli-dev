import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import Credentials from "../../interface/credentials";
import encryptPassword from "../authentication/encryptPassword";
import updateEmail from "./updateEmail";

const updateCredentials = async (req: Request, res: Response) => {
    try {
        const id : number = +req.params.id;
        const {credentials}: {credentials : Credentials} = req.body;
        const { email, password, username , phoneNumber}: Credentials = credentials;

        // query formation
        let query = 'UPDATE "user" SET';
        const values: (string | number)[] = [];
        let counter = 1;
        if (email)
            await updateEmail(id, email);
        if (password) {
            query += ` password = $${counter++},`;
            values.push(await encryptPassword(password));
        }
        if (username) {
            query += ` username = $${counter++},`;
            values.push(username);
        }
        if (phoneNumber) {
            query += ` phone_number = $${counter++},`;
            values.push(phoneNumber);
        }
        
        // make query if there is at least one field without email
        if (values.length){
        // delete the last , if there is at leat one updated value
        query = query.slice(0,-1);
        query += ` WHERE id = $${counter}`;
        values.push(id);
        const { rowCount } = await pool.query(query, values);

        // check if user exist
        if (rowCount === 0) {
            res.status(400).json({ message: "user doesn't exist" });
            return;
        }    
        }
        res.status(200).json({ message: "Credentials updated successfully" , success : true});
        } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
};

export default updateCredentials;