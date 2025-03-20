import express, { Router } from 'express';
import address from './address';
import work from './work';
import auth from './auth';
import users from './users';

const mainRouter: Router = express.Router();

mainRouter.use('/auth', auth);
mainRouter.use('/address', address);
mainRouter.use('/work', work);
mainRouter.use('/users', users);

export default mainRouter;
