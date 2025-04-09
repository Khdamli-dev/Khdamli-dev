import { Request, Response } from "express";
import pool from "../../database/dbConnection";

const deleteUser = async (req: Request, res: Response) => {
  try {
    // Get user ID from path param
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res
        .status(400)
        .json({ message: "Invalid or missing user ID", success: false });
      return;
    }

    // Check if user exists
    const userCheck = await pool.query(`SELECT id FROM "user" WHERE id = $1`, [
      userId,
    ]);
    if (!userCheck.rows.length) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }

    // Delete user—cascades handle everything
    await pool.query(`DELETE FROM "user" WHERE id = $1`, [userId]);

    // Send success response
    res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export default deleteUser;
