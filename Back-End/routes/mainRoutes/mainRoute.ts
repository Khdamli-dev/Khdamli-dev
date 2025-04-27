import express, { Router } from 'express';
import address from './address';
import work from './work';
import auth from './auth';
import users from './users';
import verifyJWT from '../../middleware/verifyJWT';

const mainRouter: Router = express.Router();

mainRouter.use('/auth', auth);
mainRouter.use('/address', verifyJWT, address);
mainRouter.use('/work' , verifyJWT ,work);
mainRouter.use('/users', verifyJWT, users);

export default mainRouter;
