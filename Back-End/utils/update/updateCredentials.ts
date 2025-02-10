import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import Credentials from "../../interface/credentials";
import encryptPassword from "../authentication/encryptPassword";

const updateCredentials = async (req: Request, res: Response) => {
    try {
        const {id, credentials}: {id : number, credentials : Credentials} = req.body;
        const { email, password, username , phoneNumber}: Credentials = credentials;

        // query formation
        let query = 'UPDATE "user" SET';
        const values: (string | number)[] = [];
        let counter = 1;
        if (email) {
            query += ` email = $${counter++},`;
            values.push(email);
        }
        if (password) {
            query += ` password = $${counter++},`;
            values.push(await encryptPassword(password));
        }
        if (username) {
            query += ` username = $${counter++},`;
            values.push(username);
        }
        if (phoneNumber) {
            query += ` phone_number = $${counter++}`;
            values.push(phoneNumber);
        }
        query += ` WHERE id = $${counter}`;
        values.push(id);
        const { rowCount } = await pool.query(query, values);

        // check if user exist
        if (rowCount === 0) {
            res.status(400).json({ message: "user doesn't exist" });
            return;
        }
        res.status(200).json({ message: "Credentials updated successfully" });
        } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" });
    }
};

export default updateCredentials;