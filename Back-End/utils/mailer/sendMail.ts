import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = async (to: string,subject : string ,html: string) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject, // Keeping a fixed subject
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendMail;
