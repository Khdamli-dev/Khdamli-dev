import express, { Router } from 'express';
import signup from './signup';
import address from './address';
import login from './login';
import work from '../workRoutes/work';

const mainRouter: Router = express.Router();

mainRouter.use('/signup', signup);
mainRouter.use('/address', address);
mainRouter.use('/login', login);
mainRouter.use('/work', work);

export default mainRouter;
