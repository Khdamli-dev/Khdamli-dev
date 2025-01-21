const express = require("express");
const dotenv = require("dotenv");
const db = require("./db"); // Import database connection
const userRoutes = require("./routes/userRoutes");
app.use("/api", userRoutes); // Prefix API routes with '/api'

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json()); // Middleware to parse JSON

// Example route
app.get("/", (req, res) => {
  res.send("Welcome to the backend API!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
