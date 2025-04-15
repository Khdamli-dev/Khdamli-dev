import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const getClientProfile = async (req: Request, res: Response) => {
  try {
    // Get client ID from path param
    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) {
      res.status(400).json({ message: "Invalid or missing client ID", client: null, success: false });
      return;
    }

    // Check if user exists and is a client (role ID 1)
    const userCheck = await pool.query(
      `
      SELECT u.id, u.role
      FROM "user" u
      WHERE u.id = $1
      `,
      [clientId]
    );

    if (!userCheck.rows.length) {
      res.status(404).json({ message: "User not found", client: null, success: false });
      return;
    }

    if (userCheck.rows[0].role !== 1) {
      res.status(403).json({ message: "User is not a client", client: null, success: false });
      return;
    }

    // Fetch client personal info and location
    const clientData = await pool.query(
      `
      SELECT 
        u.id,
        u.username,
        u.profile_image,
        u.registration_date,
        u.age,
        s.name AS sex,
        c.name AS city,
        r.name AS region,
        co.name AS country
      FROM "user" u
      LEFT JOIN sex s ON u.sex = s.id
      LEFT JOIN address a ON u.address = a.id
      LEFT JOIN city c ON a.city = c.id
      LEFT JOIN region r ON a.region = r.id
      LEFT JOIN country co ON r.country = co.id
      WHERE u.id = $1
      `,
      [clientId]
    );

    // Fetch activity metrics
    const activityData = await pool.query(
      `
      SELECT 
        COUNT(*) AS total_requests,
        COUNT(*) FILTER (WHERE rs.name = 'Completed') AS completed_requests,
        ARRAY_AGG(DISTINCT cat.name) AS categories
      FROM request req
      JOIN request_status rs ON req.status = rs.id
      JOIN category cat ON req.category = cat.id
      WHERE req.client = $1
      `,
      [clientId]
    );

    // Combine data
    const client = {
      id: clientData.rows[0].id,
      username: clientData.rows[0].username,
      profile_image: clientData.rows[0].profile_image,
      registration_date: clientData.rows[0].registration_date,
      age: clientData.rows[0].age,
      sex: clientData.rows[0].sex,
      location: {
        city: clientData.rows[0].city,
        region: clientData.rows[0].region,
        country: clientData.rows[0].country
      },
      activity: {
        total_requests: parseInt(activityData.rows[0].total_requests) || 0,
        completed_requests: parseInt(activityData.rows[0].completed_requests) || 0,
        categories: activityData.rows[0].categories || []
      }
    };

    // Send response
    res.status(200).json({
      message: "Client profile fetched successfully",
      client,
      success: true
    });
  } catch (error) {
    console.error("Error fetching client profile:", error);
    res.status(500).json({ message: "Internal server error", client: null, success: false });
  }
};

export default getClientProfile;