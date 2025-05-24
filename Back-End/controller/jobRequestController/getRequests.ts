import { Request, Response } from "express";
import pool from "../../database/dbConnection";
import dotenv from "dotenv";

dotenv.config();

const getRequests = async (req: Request, res: Response) => {
  try {
    const { client, worker, type } = req.query as {
      client?: string;
      worker?: string;
      type?: string;
    };
    // need just one field
    if (((!client && !worker) || (worker && client)) && !type) {
      res.status(400).json({
        message:
          "Please provide the type, and either worker or client, not both.",
      });
      return;
    }

    const onholdRequestStatusId: string | undefined =
      process.env.ON_HOLD_REQUEST_ID;
      
    const publicRequestId: string | undefined = process.env.PUBLIC_REQUEST_ID;
    const acceptedRequestStatusId: string | undefined =
      process.env.ACCEPTED_REQUEST_ID;
      
    if (
      !onholdRequestStatusId ||
      !publicRequestId ||
      !acceptedRequestStatusId
    ) {
      throw new Error("missing envirement variables");
    }

    let query: string;
    let values: any[] = [];

    if (worker && +type! === +publicRequestId) {
      // Special case: type 1 (public), get requests where the worker commented
      query = `
      SELECT r.id
      FROM request r
      INNER JOIN public_request_messages prm ON r.id = prm.request
      WHERE r.type = $3 
      AND r.status IN ($2, $4)    
      AND prm.worker = $1`;
      values = [+worker, +onholdRequestStatusId, +publicRequestId, +acceptedRequestStatusId];
    } else {
      query = `SELECT id FROM request WHERE`;
      if (worker) {
        query += ` worker = $1`;
        values.push(+worker);
      } else if (client) {
        query += ` client = $1`;
        values.push(+client);
      }
      query += ` AND status IN($3, $4) AND type = $2`;
      values.push(+type!, +onholdRequestStatusId, +acceptedRequestStatusId);
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
