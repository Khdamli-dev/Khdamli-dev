import pool from "../../database/dbConnection";

const checkUsername = async (username : String): Promise<boolean> => {
    const {rows : existUsername} = await pool.query(`
        SELECT id from "user"
        where username=$1
        `,[username]);
    return !existUsername.length;
}

export default checkUsername;