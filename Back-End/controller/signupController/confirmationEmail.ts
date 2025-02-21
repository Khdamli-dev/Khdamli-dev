import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import storeToken from './storeToken';
import sendMail from '../../utils/mailer/sendMail';

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
    await sendMail( email, 
        'Email Confirmation',
        `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        .container {
            max-width: 480px;
            margin: 30px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
        }
        .header {
            font-size: 22px;
            font-weight: bold;
            color: #333;
        }
        .message {
            font-size: 16px;
            color: #555;
            margin-top: 15px;
        }
        .btn {
            display: inline-block;
            background: #28a745;
            color: #fff;
            font-size: 16px;
            font-weight: bold;
            padding: 12px 20px;
            border-radius: 5px;
            text-decoration: none;
            margin-top: 20px;
            transition: 0.3s;
        }
        .btn:hover {
            background: #218838;
        }
        .footer {
            font-size: 13px;
            color: #777;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Kdamli-Dev</div>
        <p class="header">Verify Your Email</p>
        <p class="message">Hello,</p>
        <p class="message">Thank you for signing up! Click the button below to verify your email address.</p>
        <a href="${process.env.BASE_URL}/${token}" class="btn">Verify Email</a>
        <p class="message">If you didn't request this, you can ignore this email.</p>
        <p class="footer">The Kdamli-Dev Team</p>
    </div>
</body>
</html>
`)
        
    } catch (error) {
        console.log(error);
    }
}

export default confirmationEmail;