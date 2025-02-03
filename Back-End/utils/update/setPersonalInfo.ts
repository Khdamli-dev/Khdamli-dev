import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import PersonalInfo from "../../interface/personalInfo";

const setPersonalInfo = async (req: Request, res : Response) => {
    const id: number = +req.params.id;
    const {age, sex, address}: PersonalInfo = req.body.personalInfo;
    if (!id){
        res.status(400).json({message : "id is required"});
        return;
    }
    const {rowCount : result} = await pool.query(`
        UPDATE "user"
        SET age=$1, sex=$2, address=$3
        where id=$4
        `, [age,sex,address,id]);
    if (!result){
        res.status(400).json({message : "user don 't exist"});
        return;
    }
    res.status(200).json({message : "set personal info with succes"});
}

export default setPersonalInfo;