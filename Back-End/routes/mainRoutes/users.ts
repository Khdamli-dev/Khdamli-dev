import express, { Router } from 'express';
import updateProfile from '../../controller/profile/updateProfile';
import assignAddress from '../../middleware/assignAddress';
import changeToWorkerRole from "../../controller/profile/changeToWorkerRole";
import { uploadProfilePicture } from "../../controller/upload/uploadProfilePicture";
import deleteUser from '../../controller/profile/deleteUser';
import getClientProfile from '../../controller/profile/getClientProfile'; 
import getWorkerProfile from '../../controller/profile/getWorkerProfile';

const users: Router = express.Router();

users.put('/:id', assignAddress, updateProfile);
users.put('/:id/role/worker', changeToWorkerRole);
users.put('/:id/profile-picture',uploadProfilePicture);
users.delete('/:id', deleteUser);
users.get('/client/:id', getClientProfile);
users.get('/worker/:id', getWorkerProfile);
export default users;
