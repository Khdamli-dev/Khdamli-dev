import pg from "pg";
import dotenv from 'dotenv';

const {Pool} = pg;
dotenv.config();

const pool = new Pool({
    user : process.env.DB_USERNAME,
    host : process.env.DB_HOST,
    database : process.env.DB_NAME,
    password : process.env.DB_PASSWORD,
    port : Number(process.env.DB_PORT)
});

export default pool;