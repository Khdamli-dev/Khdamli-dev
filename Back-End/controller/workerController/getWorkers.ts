import { Request , Response } from "express";
import pool from "../../database/dbConnection";


export const getWorkers = async (req : Request , res : Response) =>{
    try {
        const {category , page } = req.query;
        const userId = req.params.userId;
        if (!userId || isNaN(+userId) ||!category || isNaN(+category)) {
            res.status(400).json({
                message : 'category or userId is not provided',
                success : false
            });
            return
        }
        let parsedPage : number;
        if (!page) {
        parsedPage = 0
        }
            else 
        {
         parsedPage = parseInt(page as string, 10)
        }
        const {rows : workers} = await pool.query(`
             SELECT w.*
             FROM worker w
             JOIN worker_category wc ON wc.worker = w.id
             JOIN "user" u ON u.id = w.id  -- Ensure the user table is properly joined
             JOIN address a ON u.address = a.id
             WHERE wc.category = $1
             AND a.region = (
                 SELECT a2.region 
                 FROM "user" u2
                 JOIN address a2 ON u2.address = a2.id
                 WHERE u2.id = $2
             )
             AND w.id <> $2
             ORDER BY (w.completed_requests * 2 - w.sent_requests) DESC
             LIMIT 20 OFFSET $3;

             `
            ,[+category ,+userId ,parsedPage]);

        if (!workers.length) {
            res.status(404).json({
                message : 'no workers fit this category',
                success : false
            });
            return
        }
        res.status(200).json({
            message : 'workers fetched with success',
            success : true,
            workers
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message : 'internal error',
            success : false
        })
    }

}