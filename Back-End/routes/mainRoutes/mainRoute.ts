import express, { Router } from 'express';
import address from './address';
import work from './work';
import auth from './auth';
import profile from './profile';
import upload from '../upload/upload';

const mainRouter: Router = express.Router();

mainRouter.use('/auth', auth);
mainRouter.use('/address', address);
mainRouter.use('/work', work);
mainRouter.use('/profile', profile);
mainRouter.use('/upload',upload);

export default mainRouter;
