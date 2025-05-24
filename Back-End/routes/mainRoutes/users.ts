import express, { Router } from "express";
import dotenv from "dotenv";
import updateProfile from "../../controller/profile/updateProfile";
import assignAddress from "../../middleware/assignAddress";
import changeToWorkerRole from "../../controller/profile/changeToWorkerRole";
import { uploadProfilePicture } from "../../controller/upload/uploadProfilePicture";
import deleteUser from "../../controller/profile/deleteUser";
import getClientProfile from "../../controller/profile/getClientProfile";
import getWorkerProfile from "../../controller/profile/getWorkerProfile";
import checkRole from "../../middleware/checkRole";
import { uploadWorkerMedia } from "../../controller/upload/uploadWorkerMedia";

const users: Router = express.Router();

dotenv.config();
const clientRoleId = Number(process.env.CLIENT_ROLE_ID);
const workerRoleId = Number(process.env.WORKER_ROLE_ID);

users.put("/:id", assignAddress, updateProfile);
users.put("/:id/role/worker", checkRole([clientRoleId]), changeToWorkerRole);
users.put("/:id/profile-picture", uploadProfilePicture);
users.delete("/:id", deleteUser);
users.get("/client/:id", getClientProfile);
users.get("/worker/:id", getWorkerProfile);
users.put("/:id/worker/media",checkRole([workerRoleId]),uploadWorkerMedia);
export default users;
