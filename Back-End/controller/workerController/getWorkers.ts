import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

export const getWorkers = async (req: Request, res: Response) => {
  try {
    console.log('nothing');
    const { category, page } = req.query;
    const userId = req.params.userId;
    if (!userId || isNaN(+userId) || !category || isNaN(+category)) {
      res.status(400).json({
        message: 'category or userId is not provided',
        success: false,
      });
      return;
    }
    let parsedPage: number;
    if (!page) {
      parsedPage = 0;
    } else {
      parsedPage = parseInt(page as string, 10);
    }
    const { rows: workers } = await pool.query(
      `
             SELECT w.*, u.username, u.sex, u.age, u.profile_image , c.name as city , r.name as region
FROM worker w
INNER JOIN worker_category wc ON wc.worker = w.id
INNER JOIN "user" u ON u.id = w.id
INNER JOIN address a ON u.address = a.id
INNER JOIN city c ON c.id = a.city
INNER JOIN region r ON r.id = a.region
WHERE w.id <> $2 AND wc.category = $1
ORDER BY (w.completed_requests * 2 - w.sent_requests) DESC
LIMIT 20 OFFSET $3;
             `,
      [+category, +userId, parsedPage],
    );
    console.log(workers);

    if (!workers.length) {
      res.status(404).json({
        message: 'no workers fit this category',
        success: false,
      });
      return;
    }
    res.status(200).json({
      message: 'workers fetched with success',
      success: true,
      workers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'internal error',
      success: false,
    });
  }
};
