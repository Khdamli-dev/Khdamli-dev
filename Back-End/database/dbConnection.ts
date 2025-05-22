import pg from "pg";
import dotenv from "dotenv";

const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// const pool = new Pool({
//   connectionString: process.env.SUPABASE_DB_URL, // Use Supabase connection URL
//   ssl: {
//     rejectUnauthorized: false, // Required for Supabase SSL connections
//   },
// });

export default pool;
