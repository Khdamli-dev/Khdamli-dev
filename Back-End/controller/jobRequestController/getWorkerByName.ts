import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const getWorkersByName = async (req: Request, res: Response) => {
  try {
    // Get name from query param
    const name = req.query.name as string;
    if (!name || name.trim() === "") {
      res.status(400).json({ message: "Name is required", workers: null });
      return;
    }

    // Pagination from query param (default page 1)
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Search workers by username with pagination
    const { rows } = await pool.query(
      `
      SELECT 
        u.id,
        u.username,
        u.phone_number,
        u.email,
        u.age,
        u.sex,
        u.address,
        u.registration_date AS user_registration_date,
        u.profile_image,
        w.registration_date AS worker_registration_date,
        w.bio,
        w.active,
        w.transport,
        w.sent_requests,
        w.accepted_requests,
        w.completed_requests,
        w.nbr_media
      FROM "user" u
      JOIN "worker" w ON w.id = u.id
      WHERE u.username ILIKE $1
      ORDER BY u.id ASC
      LIMIT $2 OFFSET $3
    `,
      [`%${name}%`, limit, offset]
    );

    // Count total matches for pagination info (optional)
    const totalResult = await pool.query(
      `
      SELECT COUNT(*) 
      FROM "user" u
      JOIN "worker" w ON w.id = u.id
      WHERE u.username ILIKE $1
    `,
      [`%${name}%`]
    );
    const total = parseInt(totalResult.rows[0].count);

    // If no matches, return empty array
    if (rows.length === 0) {
      res.status(200).json({
        message: "No workers found with that name",
        workers: [],
      });
      return;
    }

    // Send paginated workers
    res.status(200).json({
      message: "Workers found successfully",
      workers: rows,
      page,
      limit,
      total,
      success: true,
    });
  } catch (error) {
    console.error("Error searching workers by name:", error);
    res.status(500).json({ message: "Internal server error", workers: null });
  }
};

export default getWorkersByName;
