import { Request, Response } from 'express';
import pool from '../../database/dbConnection';

const getPublicRequestsForWorker = async (req: Request, res: Response) => {
  try {
    // Get worker ID from query param
    const workerId = parseInt(req.query.id as string);
    
    if (isNaN(workerId)) {
      res.status(400).json({ message: 'Invalid or missing worker ID', requests: null });
      return;
    }

    // Pagination from query param (default page 1)
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Category from body (optional)
    const { category } = req.body;

    // Step 1: Get worker's categories and address
    const workerData = await pool.query(`
      SELECT wc.category, a.region, a.city
      FROM worker_category wc
      JOIN "user" u ON u.id = wc.worker
      LEFT JOIN address a ON a.id = u.address
      WHERE wc.worker = $1
    `, [workerId]);

    if (!workerData.rows.length) {
      res.status(404).json({ message: 'Worker not found or no categories assigned', requests: null });
      return;
    }

    const workerCategories = workerData.rows.map(row => row.category);
    const workerRegion = workerData.rows[0].region;
    const workerCity = workerData.rows[0].city;

    // Step 2: Validate category if provided
    let selectedCategory = null;
    if (category) {
      if (!workerCategories.includes(category)) {
        res.status(400).json({ message: 'Invalid category for this worker', requests: null });
        return;
      }
      selectedCategory = category;
    }

    // Step 3: Build the query
    const conditions = [
      'r.type = 1', // Public requests
      'r.status = 3', // On Hold
      selectedCategory ? 'r.category = $1' : 'r.category = ANY($1)',
    ];

    const values: any[] = [selectedCategory || workerCategories];
    const query = `
      SELECT r.*, a.region AS client_region, a.city AS client_city
      FROM request r
      JOIN address a ON a.id = r.client_address
      WHERE ${conditions.join(' AND ')}
      ORDER BY 
        CASE WHEN a.city = $2 THEN 0 ELSE 1 END,
        CASE WHEN a.region = $3 THEN 0 ELSE 1 END,
        r.sent_time DESC
      LIMIT $4 OFFSET $5
    `;
    values.push(workerCity || null, workerRegion, limit, offset);

    const { rows } = await pool.query(query, values);

    // Step 4: Send clean response
    res.status(200).json({
      message: 'Public requests fetched successfully',
      requests: rows,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching public requests for worker:', error);
    res.status(500).json({ message: 'Internal server error', requests: null });
  }
};

export default getPublicRequestsForWorker;