import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import Credentials from "../../interface/credentials";
import checkEmail from "../validator/checkEmail";
import checkPassword from "../validator/checkPassword";
import checkUsername from "../validator/checkUsername";
import checkPhoneNumber from "../validator/checkPhoneNumber";

const updateCredentials = async (req: Request, res: Response) => {
    try {
        const id: number = +req.params.id;
        const { credentials }: { credentials?: Credentials } = req.body;
        if (!credentials) {
            res.status(400).json({ message: "credentials is required" });
            return;
        }
        const { email, password, username , phoneNumber}: Credentials = credentials;

        if (!id) {
            res.status(400).json({ message: "id is required" });
            return;
        }
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

        let query = 'UPDATE "user" SET';
        const values: (string | number)[] = [];
        let counter = 1;

        if (email) {
            query += ` email = $${counter++},`;
            values.push(email);
        }

        if (password) {
            query += ` password = $${counter++},`;
            values.push(password);
        }

        if (username) {
            query += ` username = $${counter++},`;
            values.push(username);
        }
        if (phoneNumber) {
            query += ` phone_number = $${counter++},`;
            values.push(phoneNumber);
        }

        if (values.length > 0) {
            query = query.slice(0, -1);
            query += ` WHERE id = $${counter}`;
            values.push(id);
            const { rowCount } = await pool.query(query, values);

            if (rowCount === 0) {
                res.status(400).json({ message: "user doesn't exist" });
                return;
            }

            res.status(200).json({ message: "Credentials updated successfully" });
            console.log('Credentials updated successfully');
        } else {
            res.status(400).json({ message: "No valid fields provided to update" });
            console.log('No valid fields provided to update');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" });
    }
};

export default updateCredentials;
