import { Request, Response } from 'express';
import pool from '../../database/dbConnection';
import PersonalInfo from '../../interface/personalInfo';

const setPersonalInfo = async (req: Request, res: Response) => {
  try {
    const {id, personalInfo} : {id : number, personalInfo : PersonalInfo} = req.body;
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
      query += ` sex = $${counter++}`;
      values.push(sex);
    }
    query += ` WHERE id = $${counter}`;
    values.push(id);
    const { rowCount } = await pool.query(query, values);
    
    // check if user exist
    if (rowCount === 0) {
      res.status(400).json({ message: "user doesn't exist" });
      return;
    }
    res.status(200).json({ message: 'User information added successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'internal server error' });
  }
};

export default setPersonalInfo;