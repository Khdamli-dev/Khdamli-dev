import express, { Router } from "express";
import changeToWorkerRole from "../../controller/profile/changeToWorkerRole";

const role: Router = express.Router();

role.post("/worker", changeToWorkerRole);

export default role;
