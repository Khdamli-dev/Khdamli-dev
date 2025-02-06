import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import PersonalInfo from "../../interface/personalInfo";

const setPersonalInfo = async (req: Request, res : Response) => {
    try {
    const id: number = +req.params.id;
    const {age, sex, address}: PersonalInfo = req.body.personalInfo;
    if (!id){
        res.status(400).json({message : "id is required"});
        return;
    }
    let query = 'UPDATE "user" SET';
        const values: (string | number)[] = [];
        let counter = 1;

        if (age) {
            query += ` age = $${counter++},`;
            values.push(age);
        }

        if (address) {
            query += ` address = $${counter++},`;
            values.push(address);
        }

        if (sex) {
            query += ` sex = $${counter++},`;
            values.push(sex);
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

            res.status(200).json({ message: "User information added successfully" });
            console.log('User information added successfully');
        } else {
            res.status(400).json({ message: "No valid fields provided to update" });
            console.log('No valid fields provided to update');
        }   
    } catch (error) {
    console.log(error);
    res.status(500).json({message : "internal server error"});
    }
    
}

export default setPersonalInfo;