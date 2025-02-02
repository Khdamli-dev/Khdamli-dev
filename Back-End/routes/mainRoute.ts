import express,{Router} from 'express';
import signup from './signup';
import address from './address';

const mainRouter:Router = express.Router();

mainRouter.use('/signup', signup);
mainRouter.use('/address', address);

export default mainRouter;