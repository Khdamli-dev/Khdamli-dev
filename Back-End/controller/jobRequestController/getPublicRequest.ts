import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

const getPublicRequest = async (req : Request, res : Response) => {
    const client : string = req.params.client;
    if (Number.isNaN(+client)){
        res.status(400).json({ 
            message: 'Please provide client id',
            requests : null 
        });
        return;
    } 
    try {
        const { rows } = await pool.query(`
            SELECT * FROM request
            WHERE client=$1 AND type=1
            `, [+client]);
        res.status(200).json({
            message : "select public requests with success",
            results : rows
        });
    } catch (error) {
        console.error('error in get public request for client : ', error);
        res.status(500).json({ 
          message: 'Internal server error',
          requests : null
        });
    }
}

export default getPublicRequest;