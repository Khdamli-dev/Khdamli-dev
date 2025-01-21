const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT, // Default is 5432
});

pool.on("connect", () => {
  console.log("Connected to the PostgreSQL database.");
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
