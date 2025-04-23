import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const getPublicRequests = async (req: Request, res: Response) => {
  try {
    // Get user ID and role from path/query params
    const userId = parseInt(req.params.id);
    const role = req.query.role as string;
    if (isNaN(userId)) {
      res.status(400).json({
        message: "Invalid or missing user ID",
        requests: null,
        success: false,
      });
      return;
    }
    if (!role || !["client", "worker"].includes(role)) {
      res.status(400).json({
        message: "Invalid or missing role parameter",
        requests: null,
        success: false,
      });
      return;
    }

    // Pagination from query param (default page 1)
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Category from query param (optional for workers)
    const category = req.query.category
      ? parseInt(req.query.category as string)
      : null;

    // Step 1: Get user's address and worker categories (if worker)
    let workerCategories: number[] | null = null;
    const userData = await pool.query(
      `
      SELECT a.region, a.city
      FROM "user" u
      LEFT JOIN address a ON a.id = u.address
      WHERE u.id = $1
      `,
      [userId]
    );

    if (!userData.rows.length || !userData.rows[0].city) {
      res.status(404).json({
        message: "User not found or no address assigned",
        requests: null,
        success: false,
      });
      return;
    }

    const userCity = userData.rows[0].city;
    const userRegion = userData.rows[0].region;

    // Step 2: For workers, validate categories
    if (role === "worker") {
      const workerData = await pool.query(
        `
        SELECT wc.category
        FROM worker_category wc
        WHERE wc.worker = $1
        `,
        [userId]
      );

      if (!workerData.rows.length) {
        res.status(404).json({
          message: "Worker not found or no categories assigned",
          requests: null,
          success: false,
        });
        return;
      }

      workerCategories = workerData.rows.map((row) => row.category);
      if (category && !workerCategories.includes(category)) {
        res.status(400).json({
          message: "Category not assigned to this worker",
          requests: null,
          success: false,
        });
        return;
      }
    }

    // Step 3: Build the main query for public requests
    const conditions = [
      "r.type = 1", // Public requests
      "r.status = 3", // On Hold
    ];

    if (role === "worker") {
      conditions.push(category ? "r.category = $1" : "r.category = ANY($1)");
    }

    const values: any[] =
      role === "worker" ? [category || workerCategories] : [];
    const query = `
      SELECT 
        r.id,
        r.client AS client_id,
        r.sent_time,
        r.working_time,
        r.description,
        c.name AS category,
        a.region AS client_region_id,
        a.city AS client_city_id,
        ct.name AS city,
        rg.name AS region,
        u.username AS user_name,
        u.profile_image
      FROM request r
      JOIN category c ON r.category = c.id
      JOIN address a ON r.client_address = a.id
      JOIN city ct ON a.city = ct.id
      JOIN region rg ON a.region = rg.id
      JOIN "user" u ON r.client = u.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY 
        CASE WHEN a.city = $${values.length + 1} THEN 0 ELSE 1 END,
        CASE WHEN a.region = $${values.length + 2} THEN 0 ELSE 1 END,
        r.sent_time DESC
      LIMIT $${values.length + 3} OFFSET $${values.length + 4}
    `;
    values.push(userCity || null, userRegion, limit, offset);

    const { rows } = await pool.query(query, values);

    // Step 4: Fetch media for each request
    const requests = await Promise.all(
      rows.map(async (row) => {
        const mediaData = await pool.query(
          `
          SELECT mt.name AS type, rm.url
          FROM request_media rm
          JOIN media_type mt ON rm.media_type = mt.id
          WHERE rm.request = $1
          `,
          [row.id]
        );

        const media: { type: "image" | "video" | "none"; url?: string }[] =
          mediaData.rows.length
            ? mediaData.rows.map((m) => ({
                type: m.type.toLowerCase() as "image" | "video",
                url: m.url,
              }))
            : [{ type: "none" }];

        return {
          id: row.id,
          clientId: row.client_id,
          userName: row.user_name,
          profileImage: row.profile_image,
          region: row.region,
          city: row.city,
          sent_time: row.sent_time.toISOString(),
          working_time: row.working_time.toISOString(),
          category: row.category,
          description: row.description || "",
          media,
        };
      })
    );

    // Step 5: Send response
    res.status(200).json({
      message: "Public requests fetched successfully",
      requests,
      page,
      limit,
      success: true,
    });
    return;
  } catch (error) {
    console.error("Error fetching public requests:", error);
    res.status(500).json({
      message: "Internal server error",
      requests: null,
      success: false,
    });
    return;
  }
};

export default getPublicRequests;
