import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import storeToken from './storeToken';

dotenv.config();

const confirmationEmail = async (userId : number, email : string) => {
    try {
    const token = jwt.sign({
        userId
        },
        process.env.JWT_SECRET || '',
        {
            expiresIn : '1h'
        }
    );
    // store token in database
    await storeToken(userId,token);
    // setup email transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use another service if needed
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    // Email content
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Email Confirmation',
        html: `<p>Click <a href="${process.env.BASE_URL}/${token}">here</a> to verify your email.</p>`
        // this link used to open route in frontend app instead of of open backend route in backend
        //html: `<p>Click <a href="${process.env.FRONTEND_URL}/token=${token}">here</a> to verify your email.</p>`
    };
    await transporter.sendMail(mailOptions); 
    } catch (error) {
        console.log(error);
    }
}

export default confirmationEmail;