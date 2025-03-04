import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // 👈 Ignores self-signed cert errors
  },
});



const sendMail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject, // Keeping a fixed subject
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendMail;
