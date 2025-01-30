import express,{Router} from 'express';
import checkInfo from '../controller/signupController/checkInfo';

const signup:Router = express.Router();

signup.post('/checkInfo',checkInfo);

export default signup;