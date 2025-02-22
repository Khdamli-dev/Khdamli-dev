import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import storeToken from './storeToken';
import sendMail from '../../utils/mailer/sendMail';
import { emailConfirmationMail } from '../../utils/mailer/emailBody';

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
        emailConfirmationMail(token)
        )
        
    } catch (error) {
        console.log(error);
    }
}

export default confirmationEmail;