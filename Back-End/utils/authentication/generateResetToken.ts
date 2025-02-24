import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || '';

export const generateResetToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" }); // Token valid for 1 hour
};
