import pool from './../../database/dbConnection'

const storeToken = async (userId : number, token : string) => {
    await pool.query(`
        INSERT INTO confirmation_token(user_id, token)
        values ($1,$2)
        ON CONFLICT (user_id) DO UPDATE
        SET token = EXCLUDED.token
        `,[userId,token]);
}

export default storeToken;