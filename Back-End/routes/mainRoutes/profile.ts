import express, { Router } from 'express';
import update from '../profile/updateInfo';

const profile: Router = express.Router();

profile.use('/update', update);

export default profile;
