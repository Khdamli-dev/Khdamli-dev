
import pool from '../../database/dbConnection';
const updateWorkerCategories = async (workerId: number, categories: number[]) => {
  if (Number.isNaN(workerId) || !Array.isArray(categories)) {
    throw new Error('Invalid worker ID or categories');
  }
  const result = await pool.query(
    `SELECT category FROM worker_category WHERE worker = $1`,
    [workerId]
  );
  const currentCategories: number[] = result.rows.map(row => row.category);

  const newSet = new Set(categories);
  const currentSet = new Set(currentCategories);

  const toAdd = categories.filter(c => !currentSet.has(c));
  const toDelete = currentCategories.filter(c => !newSet.has(c));

  if (toDelete.length > 0) {
    await pool.query(
      `DELETE FROM worker_category WHERE worker = $1 AND category = ANY($2::int[])`,
      [workerId, toDelete]
    );
  }

  await Promise.all(
    toAdd.map(async (categoryId) => {
      await pool.query(
        `INSERT INTO worker_category (worker, category, unity)
         VALUES ($1, $2, $3)`,
        [workerId, categoryId, 1]
      );
    })
  );
};

export default updateWorkerCategories;
