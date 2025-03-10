import express, { Router } from 'express';
import updateProfile from '../../controller/profile/updateProfile';
import assignAddress from '../../middleware/assignAddress';
import changeToWorkerRole from "../../controller/profile/changeToWorkerRole";

const users: Router = express.Router();

users.put('/:id', assignAddress, updateProfile);
users.put('/:id/role/worker', changeToWorkerRole);

export default users;
