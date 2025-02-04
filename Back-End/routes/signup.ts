import express, { Router, Request, Response } from 'express';
import checkInfo from '../middleware/checkInfo';
import createUser from '../controller/signupController/createUser';
import assignAddress from '../middleware/assignAddress';
import updateProfile from '../controller/profile/updateProfile';
import confirmationEmail from '../controller/signupController/confirmationEmail';

const signup: Router = express.Router();

signup.post('/credentials', checkInfo , createUser); 
signup.post('/personal-info/:id', assignAddress , updateProfile);
signup.post('/resend-email', async (req: Request, res : Response) => {
    try {
    const {userId, email} : {userId : number, email : string} = req.body;
    await confirmationEmail(userId,email); 
    res.status(200).json({message : "resend email with success"});   
    } catch (error) {
      console.log(error); 
      res.status(500).json({ message: 'internal error' }); 
    }
});

export default signup;