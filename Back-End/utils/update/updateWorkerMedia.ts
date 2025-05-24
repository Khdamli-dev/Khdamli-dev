import pool from "../../database/dbConnection";
export const updateWorkerMedia = async (File: {
    fileUrl: string;
    fileType: string;
} , workerId : number) => {
  const type = File.fileType === 'image' ? 1 : 2;
  await pool.query(
    `INSERT INTO worker_media (worker, media_type, url) VALUES ($1, $2, $3) `,
    [ workerId, type , File.fileUrl ]);
} 