import express,{Router} from 'express';
import signup from './signup';

const mainRouter:Router = express.Router();

mainRouter.use('/signup', signup);

export default mainRouter;