// utils/update/updateWorkingHours.ts
import pool from '../../database/dbConnection';

interface WorkingHour {
  day: number;
  begin: string;
  end: string;
}

const updateWorkingHours = async (workerId: number, workingHours: WorkingHour[]) => {
  if (Number.isNaN(workerId) || !Array.isArray(workingHours)) {
    throw new Error('Invalid worker ID or working hours');
  }

  const existingResult = await pool.query(
    'SELECT day FROM time_work WHERE worker = $1',
    [workerId]
  );
  const existingDays: number[] = existingResult.rows.map(row => row.day);
  const requestDays = workingHours.map(wh => wh.day);

  const toDelete = existingDays.filter(day => !requestDays.includes(day));

  if (toDelete.length > 0) {
    await pool.query(
      `DELETE FROM time_work WHERE worker = $1 AND day = ANY($2::int[])`,
      [workerId, toDelete]
    );
  }

  await Promise.all(
    workingHours.map(async ({ day, begin, end }) => {
      await pool.query(
        `
        INSERT INTO time_work(worker, day, "begin", "end")
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (worker, day)
        DO UPDATE SET "begin" = EXCLUDED."begin", "end" = EXCLUDED."end"
        `,
        [workerId, day, begin, end]
      );
    })
  );
};

export default updateWorkingHours;
