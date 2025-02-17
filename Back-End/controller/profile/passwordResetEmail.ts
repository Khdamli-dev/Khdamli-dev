import nodemailer from "nodemailer";
import { generateResetToken } from "../../utils/authentication/generateResetToken"; // Import your token function
import storeToken from "../signupController/storeToken";

const passwordResetEmail = async (email: string, userId: number) => {
  
    const token = generateResetToken(userId);
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;

  await storeToken(userId,token);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset Request",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });

};
export default passwordResetEmail;
