import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import Credentials from "../../interface/credentials";
import checkEmail from "../validator/checkEmail";
import checkPassword from "../validator/checkPassword";
import checkUsername from "../validator/checkUsername";
import checkPhoneNumber from "../validator/checkPhoneNumber";
import { encryptPassword } from "../authentication/encryptPassword";

const updateCredentials = async (req: Request, res: Response) => {
    try {
        const {id, credentials}: {id : number, credentials : Credentials} = req.body;
        const { email, password, username , phoneNumber}: Credentials = credentials;
        
        // validation of credentials
        if (email && ! await checkEmail(email)) {
            res.status(400).json({ message: "Invalid email format" });
            return;
        }
        if (password && !checkPassword(password)) {
            res.status(400).json({ message: "Password does not meet requirements" });
            return;
        }
        if (username && ! await checkUsername(username)) {
            res.status(400).json({ message: "Username is invalid" });
            return;
        }
        if (phoneNumber && ! await checkPhoneNumber(phoneNumber)) {
            res.status(400).json({ message: "Phone number is invalid" });
            return;
        }

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