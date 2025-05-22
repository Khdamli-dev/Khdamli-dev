import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const getRequestDetails = async (req: Request, res: Response) => {
  try {
    // Validate requestId
    const requestId = parseInt(req.params.requestId);
    if (isNaN(requestId)) {
      res
        .status(400)
        .json({ message: "Invalid request ID", request: null, success: false });
      return;
    }

    // Validate query params
    const { role, request_type, worker_id } = req.query as {
      role?: string;
      request_type?: string;
      worker_id?: string;
    };

    if (!role || !["client", "worker"].includes(role)) {
      res.status(400).json({
        message: "Invalid or missing role parameter",
        request: null,
        success: false,
      });
      return;
    }

    if (!request_type || !["public", "private"].includes(request_type)) {
      res.status(400).json({
        message: "Invalid or missing request_type parameter",
        request: null,
        success: false,
      });
      return;
    }

    // Validate worker_id for worker's public request
    let workerId: number | undefined;
    if (role === "worker" && request_type === "public") {
      workerId = parseInt(worker_id || "");
      if (isNaN(workerId)) {
        res.status(400).json({
          message: "Missing or invalid worker_id for worker public request",
          request: null,
          success: false,
        });
        return;
      }
    }

    // Fetch request details
    const requestData = await pool.query(
      `
      SELECT 
        r.worker AS worker_id,
        r.client AS client_id,
        r.sent_time,
        r.working_time,
        r.description,
        r.status AS status_id,
        c.name AS category,
        a.city AS city_id,
        a.region AS region_id,
        ct.name AS city,
        rg.name AS region,
        co.name AS country,
        rs.name AS status,
        uc.username AS client_username,
        uc.phone_number AS client_phone_number,
        uc.profile_image AS client_profile_image,
        uw.username AS worker_username,
        uw.profile_image AS worker_profile_image
      FROM request r
      LEFT JOIN category c ON r.category = c.id
      LEFT JOIN address a ON r.client_address = a.id
      LEFT JOIN city ct ON a.city = ct.id
      LEFT JOIN region rg ON a.region = rg.id
      LEFT JOIN country co ON rg.country = co.id
      LEFT JOIN request_status rs ON r.status = rs.id
      LEFT JOIN "user" uc ON r.client = uc.id
      LEFT JOIN worker w ON r.worker = w.id
      LEFT JOIN "user" uw ON w.id = uw.id
      WHERE r.id = $1
      `,
      [requestId]
    );

    if (!requestData.rows.length) {
      res
        .status(404)
        .json({ message: "Request not found", request: null, success: false });
      return;
    }

    const requestRow = requestData.rows[0];

    // Fetch media
    const mediaData = await pool.query(
      `
      SELECT mt.name AS type, rm.url
      FROM request_media rm
      LEFT JOIN media_type mt ON rm.media_type = mt.id
      WHERE rm.request = $1
      `,
      [requestId]
    );

    const media = mediaData.rows.map((row) => ({
      type: row.type,
      url: row.url,
    }));

    // Fetch worker comment for worker's public request
    let workerComment: string | null = null;
    let commentDate: string | null = null;
    if (role === "worker" && request_type === "public" && workerId) {
      const commentData = await pool.query(
        `
        SELECT message, created_at
        FROM public_request_messages
        WHERE request = $1 AND worker = $2
        `,
        [requestId, workerId]
      );
      if (commentData.rows.length) {
        workerComment = commentData.rows[0].message;
        commentDate = commentData.rows[0].created_at.toISOString();
      }

      const onholdRequestId : string | undefined = process.env.ON_HOLD_REQUEST_ID;
      if (!onholdRequestId){
        throw new Error("missing envirement variables");
      }
      if (requestRow.worker_id == workerId && requestRow.status_id == onholdRequestId){
        requestRow.status = "verification pending";
      }
    }

    // Build response based on role and request_type
    const response: { [key: string]: any } = {};

    // Common fields across scenarios
    response.workerId = requestRow.worker_id;
    response.clientId = requestRow.client_id;
    response.id = requestId;
    response.category = requestRow.category;
    response.description = requestRow.description || null;
    response.media = media;
    response.status = requestRow.status;
    response.location = {
      city: requestRow.city,
      region: requestRow.region,
      country: requestRow.country,
    };

    if (role === "client") {
      if (request_type === "public") {
        response.sent_date = requestRow.sent_time.toISOString();
        response.work_date = requestRow.working_time.toISOString();
      } else {
        // private
        response.sent_date = requestRow.sent_time.toISOString();
        response.worker_username = requestRow.worker_username;
        response.worker_profile_image = requestRow.worker_profile_image;
      }
    } else {
      // role === "worker"
      if (request_type === "public") {
        response.client_id = requestRow.client_id;
        response.client_username = requestRow.client_username;
        response.client_profile_image = requestRow.client_profile_image;
        response.worker_comment = workerComment;
        response.comment_date = commentDate;
        response.post_date = requestRow.sent_time.toISOString();
      } else {
        // private
        response.client_id = requestRow.client_id;
        response.client_phone_number = requestRow.client_phone_number;
        response.client_username = requestRow.client_username;
        response.client_profile_image = requestRow.client_profile_image;
        response.client_location = response.location;
        response.sent_date = requestRow.sent_time.toISOString();
      }
    }

    // Send response
    res.status(200).json({
      message: "Request details fetched successfully",
      request: response,
      success: true,
    });
    return;
  } catch (error) {
    console.error("Error fetching request details:", error);
    res.status(500).json({
      message: "Internal server error",
      request: null,
      success: false,
    });
    return;
  }
};

export default getRequestDetails;
