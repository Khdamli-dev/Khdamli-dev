const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all users
router.get("/users", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Add a new user
router.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
