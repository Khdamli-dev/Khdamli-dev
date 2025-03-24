import express, { Router } from 'express';
import updateProfile from '../../controller/profile/updateProfile';
import assignAddress from '../../middleware/assignAddress';
import changeToWorkerRole from "../../controller/profile/changeToWorkerRole";
import { uploadProfilePicture } from "../../controller/upload/uploadProfilePicture"

const users: Router = express.Router();

users.put('/:id', assignAddress, updateProfile);
users.put('/:id/role/worker', changeToWorkerRole);
users.put('/:id/profile-picture',uploadProfilePicture);

export default users;
