import pool from "../../database/dbConnection";
import checkEmail from "./checkEmail";

// this function update user email if confirmed email is about updated one
const updatedEmail = async (userId : number) => {
    const {rows : result} = await pool.query(`
        SELECT email from updated_email
        WHERE user_id = $1
        `, [userId]);
    if (!result.length)
        return;

    const notUsedEmail = await checkEmail(result[0].email);
    if (notUsedEmail){
        await pool.query(`
            UPDATE "user"
            SET email = $1
            WHERE id = $2
            `, [result[0].email, userId]);
    }
    await pool.query(`
        DELETE FROM updated_email
        WHERE user_id = $1
        `, [userId]);
}

export default updatedEmail;