import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import PersonalInfo from "../../interface/personalInfo";

const setPersonalInfo = async (req: Request, res: Response) => {
  try {
    const id: number = +req.params.id;
    const { personalInfo }: { personalInfo: PersonalInfo } = req.body;
    const { age, sex, address }: PersonalInfo = personalInfo;

    // query formation
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
    // delete the last , if there is at leat one updated value
    query = query.slice(0, -1);
    query += ` WHERE id = $${counter}`;
    values.push(id);
    const { rowCount } = await pool.query(query, values);

    // check if user exist
    if (rowCount == 0) {
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export default setPersonalInfo;
