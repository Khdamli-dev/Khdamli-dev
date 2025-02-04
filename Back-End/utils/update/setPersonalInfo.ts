import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import PersonalInfo from "../../interface/personalInfo";

const setPersonalInfo = async (req: Request, res: Response) => {
    try {
        const id: number = +req.params.id;
        const { personalInfo }: { personalInfo?: PersonalInfo } = req.body;

        if (!personalInfo) {
            res.status(400).json({ message: "personalInfo is required" });
            return;
        }

        if (!id) {
            res.status(400).json({ message: "id is required" });
            return;
        }

        // Initialize query parts and values
        let query = 'UPDATE "user" SET ';
        const values: (string | number)[] = [];
        let counter = 1;

        // Check which fields are provided and add them to the query
        if (personalInfo.age) {
            query += `age = $${counter++}, `;
            values.push(personalInfo.age);
        }
        if (personalInfo.sex) {
            query += `sex = $${counter++}, `;
            values.push(personalInfo.sex);
        }
        if (personalInfo.address) {
            query += `address = $${counter++}, `;
            values.push(personalInfo.address);
        }

        // If no fields were provided, send a bad request response
        if (values.length === 0) {
            res.status(400).json({ message: "No valid fields provided to update" });
            return;
        }

        // Remove trailing comma and space, then add the WHERE clause
        query = query.slice(0, -2); // Remove the trailing comma
        query += ` WHERE id = $${counter}`;
        values.push(id);

        // Execute the query
        const { rowCount } = await pool.query(query, values);

        if (rowCount === 0) {
            res.status(400).json({ message: "User doesn't exist" });
            return;
        }

        res.status(200).json({ message: "Personal info updated successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default setPersonalInfo;
