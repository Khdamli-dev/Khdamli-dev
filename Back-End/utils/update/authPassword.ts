import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import authenticatePassword from "../authentication/authenticatePassword";

const authPassword = async (req : Request , res : Response) => {
    try {
    const id : number= parseInt(req.params.id);
    const password : string= req.body.password;
    if (isNaN(id) || !password) {
        res.status(400).json({
            message : 'id or password not provided',
            success : false
        });
        return
    }
    const result = await pool.query(`SELECT password FROM "user" WHERE id=$1`,[id]);
    if (!result.rowCount) {
        res.status(404).json({
            message : 'user does not exist',
            success : false
        });
        return;
    }
    const currentpwd : string = result.rows[0].password;
        const validPassword = await authenticatePassword(
      currentpwd,
      password
    );
    if (!validPassword) {
      res.status(403).json({
        success: false,
        message: "password is wrong",
        validEmail: true,
        validPassword: false,
      });
      return;
    }
    res.status(200).json({
        message : 'password is correct',
        success : true 
    });
    } catch (err) {
        res.status(500).json({
            message : 'internal error',
            success : false
        })
    }
}
export default authPassword;