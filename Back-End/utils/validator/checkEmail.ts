import pool from "../../database/dbConnection";

const checkEmail = async (email : String): Promise<boolean> => {
    const {rows : existEmail} = await pool.query(`
        SELECT id from "user" 
        where email=$1
        `,[email]);
    return !existEmail.length;
}

export default checkEmail;