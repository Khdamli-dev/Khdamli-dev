import pool from "../../database/dbConnection";
export const updateProfilePicture = async (profileImage : string , id :number) => {
  await pool.query(`UPDATE "user"
SET profile_image =$1
WHERE id =$2;
`,[profileImage , id])
}