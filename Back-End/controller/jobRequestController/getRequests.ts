import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const getRequests = async (req: Request, res: Response) => {
  try {
    const { client, worker } = req.query as {
      client?: string;
      worker?: string;
    };
    // need just one field
    if ((!client && !worker) || (worker && client)) {
      res
        .status(400)
        .json({ message: "Please provide either worker or client, not both." });
      return;
    }

    let query = `
SELECT 
  r.id,

  ${
    worker
      ? `
    jsonb_build_object(
      'id', client.id,
      'username', client.username,
      'image', client.profile_image
    )`
      : `
    CASE WHEN w.id IS NOT NULL THEN jsonb_build_object(
      'id', w.id,
      'username', w.username,
      'image', w.profile_image
    ) ELSE NULL END
  `
  } AS ${worker ? "client" : "worker"},

  jsonb_build_object(
    'region', region.name,
    'city', city.name
  ) AS address,

  r.sent_time,
  r.working_time,

  jsonb_build_object(
    'id', cat.id,
    'name', cat.name
  ) AS category,

  r.description,

  rt.name AS type,
  rs.name AS status,

  COALESCE(
    jsonb_agg(
      DISTINCT jsonb_build_object(
        'url', rm.url,
        'media_type', mt.name
      )
    ) FILTER (WHERE rm.url IS NOT NULL),
    '[]'
  ) AS media

FROM request r

LEFT JOIN "user" w ON r.worker = w.id
LEFT JOIN "user" client ON r.client = client.id

LEFT JOIN address addr ON r.client_address = addr.id
LEFT JOIN region ON addr.region = region.id
LEFT JOIN city ON addr.city = city.id

LEFT JOIN category cat ON r.category = cat.id
LEFT JOIN request_type rt ON r.type = rt.id
LEFT JOIN request_status rs ON r.status = rs.id

LEFT JOIN request_media rm ON r.id = rm.request
LEFT JOIN media_type mt ON rm.media_type = mt.id

WHERE 
  ${worker ? "r.worker = $1" : "r.client = $1"}
  AND (r.status = 3 OR r.status = 1)

GROUP BY 
  r.id,
  ${
    worker
      ? "client.id, client.username, client.profile_image,"
      : "w.id, w.username, w.profile_image,"
  }
  region.name, city.name,
  cat.id, cat.name,
  rt.name,
  rs.name,
  r.sent_time, r.working_time, r.description
`;

let values = [worker ? +worker! : +client!];
    const { rows } = await pool.query(query, values);

    res.status(200).json({
      message: "select requests with success",
      requests: rows,
    });
  } catch (error) {
    console.error("error in get requests : ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default getRequests;
