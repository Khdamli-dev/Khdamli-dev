import express, { Router } from 'express';
import checkInfo from '../middleware/checkInfo';

const signup: Router = express.Router();

signup.post('/credentials', checkInfo);   // we put function that create user after checkInfo

export default signup;