import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

const getReviews = async (req: Request, res: Response) => {
  const worker: number = parseInt(req.params.workerId);
  if (isNaN(worker)) {
    res.status(400).json({
      message: 'Invalid or missing worker ID',
      success: false,
    });
    return;
  }
  try {
    const { rows } = await pool.query(
      `
        SELECT 
        r.client_id AS clientId, r.review, r.rating,
        u.username AS clientName, u.profile_image AS clientProfileImage
        FROM review r
        LEFT JOIN "user" u ON u.id = r.client_id
        WHERE r.worker_id = $1
        `,
      [worker],
    );

    res.status(200).json({
      message: 'select worker reviews with success',
      reviews: rows,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching worker reviews ', error);
    res.status(500).json({
      message: 'Internal server error',
      success: false,
    });
  }
};

export default getReviews;
