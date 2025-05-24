import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const getWorkerProfile = async (req: Request, res: Response) => {
  try {
    // Get worker ID from path param
    const workerId = parseInt(req.params.id);
    if (isNaN(workerId)) {
      res.status(400).json({
        message: "Invalid or missing worker ID",
        worker: null,
        success: false,
      });
      return;
    }

    // Check if user exists and is a worker (role ID 2)
    const userCheck = await pool.query(
      `
      SELECT u.id, u.role
      FROM "user" u
      WHERE u.id = $1
      `,
      [workerId]
    );
    if (!userCheck.rows.length) {
      res
        .status(404)
        .json({ message: "User not found", worker: null, success: false });
      return;
    }

    if (userCheck.rows[0].role !== 2) {
      res.status(403).json({
        message: "User is not a worker",
        worker: null,
        success: false,
      });
      return;
    }


    // Fetch worker personal and professional info
    const workerData = await pool.query(
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
        co.name AS country,
        w.bio,
        w.active,
        w.transport,
        w.registration_date AS worker_registration_date,
        w.sent_requests,
        w.completed_requests,
        w.review_count,
        w.review_sum,
        w.nbr_media
      FROM "user" u
      LEFT JOIN sex s ON u.sex = s.id
      LEFT JOIN address a ON u.address = a.id
      LEFT JOIN city c ON a.city = c.id
      LEFT JOIN region r ON a.region = r.id
      LEFT JOIN country co ON r.country = co.id
      JOIN worker w ON w.id = u.id
      WHERE u.id = $1
      `,
      [workerId]
    );
    if (!workerData.rowCount){
      res.status(404).json({ message: "User not found", worker: null, success: false });
      return;
    }

    // Fetch categories and pricing
    const categoriesData = await pool.query(
      `
      SELECT 
        cat.name,
        wc.price,
        u.name AS unity
      FROM worker_category wc
      JOIN category cat ON wc.category = cat.id
      JOIN unity u ON wc.unity = u.id
      WHERE wc.worker = $1
      `,
      [workerId]
    );

    // Fetch availability
    const availabilityData = await pool.query(
      `
      SELECT 
        d.name AS day,
        tw.begin,
        tw.end
      FROM time_work tw
      JOIN day d ON tw.day = d.id
      WHERE tw.worker = $1
      ORDER BY tw.day
      `,
      [workerId]
    );

    // Fetch media
    const mediaData = await pool.query(
      `
      SELECT 
        mt.name AS type,
        wm.url
      FROM worker_media wm
      JOIN media_type mt ON wm.media_type = mt.id
      WHERE wm.worker = $1
      `,
      [workerId]
    );

    // Fetch payment methods
    const paymentData = await pool.query(
      `
      SELECT 
        pm.name
      FROM worker_payment wp
      JOIN payment_method pm ON wp.payment = pm.id
      WHERE wp.worker = $1
      `,
      [workerId]
    );

    // Combine data
    const worker = {
      id: workerData.rows[0].id,
      username: workerData.rows[0].username,
      profile_image: workerData.rows[0].profile_image,
      registration_date: workerData.rows[0].registration_date,
      age: workerData.rows[0].age,
      sex: workerData.rows[0].sex,
      location: {
        city: workerData.rows[0].city,
        region: workerData.rows[0].region,
        country: workerData.rows[0].country,
      },
      bio: workerData.rows[0].bio,
      active: workerData.rows[0].active,
      transport: workerData.rows[0].transport,
      worker_registration_date: workerData.rows[0].worker_registration_date,
      categories: categoriesData.rows.map((row) => ({
        name: row.name,
        price: row.price,
        unity: row.unity,
      })),
      availability: availabilityData.rows.map((row) => ({
        day: row.day,
        begin: row.begin,
        end: row.end,
      })),
      activity: {
        sent_requests: workerData.rows[0].sent_requests || 0,
        accepted_requests: workerData.rows[0].accepted_requests || 0,
        completed_requests: workerData.rows[0].completed_requests || 0,
      },
      media: mediaData.rows.map((row) => ({
        type: row.type,
        url: row.url,
      })),
      payment_methods: paymentData.rows.map((row) => row.name),
    };

    // Send response
    res.status(200).json({
      message: "Worker profile fetched successfully",
      worker,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching worker profile:", error);
    res
      .status(500)
      .json({ message: "Internal server error", worker: null, success: false });
  }
};

export default getWorkerProfile;
