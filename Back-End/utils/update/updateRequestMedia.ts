import pool from "../../database/dbConnection";
export const updateRequestMedia = async (File: {
    fileUrl: string;
    fileType: string;
} , requestId : number) => {
  const type = File.fileType === 'image' ? 1 : 2;
  await pool.query(
    'INSERT INTO request_media (request, media_type, url) VALUES ($1, $2, $3)',
    [ requestId,type , File.fileUrl ]);
} 