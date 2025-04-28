import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const getRequests = async (req: Request, res: Response) => {
  try {
    const { client, worker, type } = req.query as {
      client?: string;
      worker?: string;
      type?: string;
    };
    // need just one field
    if (((!client && !worker) || (worker && client)) && !type) {
      res
        .status(400)
        .json({
          message:
            "Please provide the type, and either worker or client, not both.",
        });
      return;
    }

    let query: string;
    let values: any[] = [];

    if (worker && +type! === 1) {
      // Special case: type 1 (public), get requests where the worker commented
      query = `
                                SELECT r.id
FROM request r
INNER JOIN public_request_messages prm ON r.id = prm.request
WHERE r.type = 1 
  AND r.status IN (1, 3) 
  AND r.worker IS NULL 
  AND prm.worker = $1

            `;
      values = [+worker];
    } else {
      query = `SELECT id FROM request WHERE`;
      if (worker) {
        query += ` worker = $1`;
        values.push(+worker);
      } else if (client) {
        query += ` client = $1`;
        values.push(+client);
      }
      query += ` AND (status = 1 OR status = 3) AND type = $2`;
      values.push(+type!);
    }

    const { rows } = await pool.query(query, values);
    const requestIds = rows.map((row) => row.id);
    res.status(200).json({
      message: "select requests with success",
      requests: requestIds,
    });
  } catch (error) {
    console.error("error in get requests : ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default getRequests;
