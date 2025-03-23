import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

const getRequests = async (req : Request, res : Response) => {
    try {
        const { client, worker } = req.query as { client?: string; worker?: string };
        // need just one field
        if ((!client && !worker) || (worker && client)){
            res.status(400).json({ message: 'Please provide either worker or client, not both.' });
            return;
        }
 
        // format the query
        let query : string = `SELECT * FROM request WHERE`;
        let values : number[] = [];
        if (worker){
            query += ` worker=$1`;
            values.push(+worker);
        } else if (client){
            query += ` client=$1`;
            values.push(+client);
        }
        query += ` AND (status=3 OR status=1)`;  // fetch just on hold and accepted request requests, because we don 't interst about rejected or completed requests
        const { rows } = await pool.query(query, values);

        res.status(200).json({
            message : "select requests with success",
            requests : rows
        }); 
    } catch (error) {
        console.error('error in get requests : ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export default getRequests;