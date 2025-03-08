import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

const getPrivateRequest = async (req : Request, res : Response) => {
    try {
        const { client, worker } = req.query as { client?: string; worker?: string };
        // need just one field
        if ((!client && !worker) || (worker && client)){
            res.status(400).json({ 
                message: 'Please provide either worker or client, not both.',
                requests : null 
            });
            return;
        }

        let query : string = `SELECT * FROM request WHERE type=2`;
        let values : number[] = [];
        if (worker){
            query += ` AND worker=$1`;
            values.push(+worker);
        } else if (client){
            query += ` AND client=$1`;
            values.push(+client);
        }
        const { rows } = await pool.query(query, values);

        res.status(200).json({
            message : "select private requests with success",
            results : rows
        }); 
    } catch (error) {
        console.error('error in get private request : ', error);
        res.status(500).json({ 
          message: 'Internal server error',
          requests : null
        });
    }
}

export default getPrivateRequest;