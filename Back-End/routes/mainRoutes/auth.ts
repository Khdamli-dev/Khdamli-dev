import express, { Router } from 'express';
import signup from '../auth/signup';
import login from '../auth/login';

const auth : Router = express.Router();

auth.use("/signup", signup);
auth.use("/login", login);

export default auth;