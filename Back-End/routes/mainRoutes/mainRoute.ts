import express, { Router } from 'express';
import address from './address';
import worker from './worker';
import auth from './auth';
import users from './users';
import upload from '../upload/upload';

const mainRouter: Router = express.Router();

mainRouter.use('/auth', auth);
mainRouter.use('/address', address);
mainRouter.use('/worker', worker);
mainRouter.use('/users', users);
mainRouter.use('/upload',upload);

export default mainRouter;
