import pool from "../../database/dbConnection";
import { Request, Response } from 'express';
import address from '../../interface/address';
const createAddress = async (req: Request, res: Response) => {
    try {
        const { region , city , street , addressNumber }: address = req.body;
        if (!region) {
            res.status(400).json({ message: 'region is required' });
            return;
        }
        await pool.query(`
            INSERT INTO address ( region , city , street, adress_number)
            VALUES ($1, $2, $3 , $4 )`,
            [ region , city , street , addressNumber ],
        );
        res.status(200).json({ message: 'address added' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'internal error' });
    }
};
export default createAddress;
