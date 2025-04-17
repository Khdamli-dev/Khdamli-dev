import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const getRequestMessages = async (req: Request, res: Response) => {
  try {
    // Get request ID from path param
    const requestId = parseInt(req.params.requestId);
    if (isNaN(requestId)) {
      res.status(400).json({ message: "Invalid or missing request ID", messages: null, success: false });
      return;
    }

    // Pagination from query param (default page 1)
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Sort from query param (default newest)
    const sort = (req.query.sort as string)?.toLowerCase();
    if (sort && !["closest", "newest"].includes(sort)) {
      res.status(400).json({ message: "Invalid sort parameter", messages: null, success: false });
      return;
    }

    // Category filter from query param
    const matchCategory = req.query.match_category === "true";

    // Check if request exists and get client address
    const requestData = await pool.query(
      `
      SELECT 
        r.id, 
        r.category, 
        c.name AS client_city, 
        rg.name AS client_region
      FROM request r
      JOIN address a ON r.client_address = a.id
      JOIN city c ON a.city = c.id
      JOIN region rg ON a.region = rg.id
      WHERE r.id = $1
      `,
      [requestId]
    );

    if (!requestData.rows.length) {
      res.status(404).json({ message: "Request not found", messages: null, success: false });
      return;
    }

    const { client_city, client_region, category } = requestData.rows[0];

    // Get total messages (for pagination)
    let totalQuery = `SELECT COUNT(*) FROM public_request_messages prm WHERE prm.request = $1`;
    let totalParams: any[] = [requestId];

    if (matchCategory) {
      totalQuery += `
        AND EXISTS (
          SELECT 1
          FROM worker_category wc
          JOIN category c ON wc.category = c.id
          LEFT JOIN category pc ON c.parent_category = pc.id
          WHERE wc.worker = prm.worker
          AND (c.id = $2 OR pc.id = $2)
        )
      `;
      totalParams.push(category);
    }

    const totalResult = await pool.query(totalQuery, totalParams);
    const total = parseInt(totalResult.rows[0].count);

    // Build main query
    let query = `
      SELECT 
        prm.worker AS worker_id,
        prm.message,
        prm.created_at,
        u.username,
        u.profile_image,
        c.name AS city,
        r.name AS region,
        co.name AS country,
        ARRAY_AGG(DISTINCT cat.name) AS categories
      FROM public_request_messages prm
      JOIN worker w ON prm.worker = w.id
      JOIN "user" u ON w.id = u.id
      LEFT JOIN address a ON u.address = a.id
      LEFT JOIN city c ON a.city = c.id
      LEFT JOIN region r ON a.region = r.id
      LEFT JOIN country co ON r.country = co.id
      LEFT JOIN worker_category wc ON w.id = wc.worker
      LEFT JOIN category cat ON wc.category = cat.id
      WHERE prm.request = $1
    `;
    let params: any[] = [requestId];

    if (matchCategory) {
      query += `
        AND EXISTS (
          SELECT 1
          FROM worker_category wc2
          JOIN category c2 ON wc2.category = c2.id
          LEFT JOIN category pc ON c2.parent_category = pc.id
          WHERE wc2.worker = prm.worker
          AND (c2.id = $2 OR pc.id = $2)
        )
      `;
      params.push(category);
    }

    query += ` GROUP BY prm.worker, prm.message, prm.created_at, u.username, u.profile_image, c.name, r.name, co.name`;

    // Add sorting
    let paramIndex = params.length + 1;
    if (sort === "closest") {
      query += `
        ORDER BY 
          CASE WHEN c.name = $${paramIndex} THEN 0 ELSE 1 END,
          CASE WHEN r.name = $${paramIndex + 1} THEN 0 ELSE 1 END,
          prm.created_at DESC
      `;
      params.push(client_city, client_region);
      paramIndex += 2;
    } else {
      query += ` ORDER BY prm.created_at DESC`;
    }

    // Add limit and offset
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute query
    const messagesData = await pool.query(query, params);

    // Format response
    const messages = messagesData.rows.map(row => ({
      worker_id: row.worker_id,
      username: row.username,
      profile_image: row.profile_image,
      location: {
        city: row.city,
        region: row.region,
        country: row.country
      },
      categories: row.categories?.filter(Boolean) || [],
      message: row.message,
      created_at: row.created_at
    }));

    // Send response
    res.status(200).json({
      message: "Request messages fetched successfully",
      messages,
      page,
      limit,
      total,
      success: true
    });
  } catch (error) {
    console.error("Error fetching request messages:", error);
    res.status(500).json({ message: "Internal server error", messages: null, success: false });
  }
};

export default getRequestMessages;