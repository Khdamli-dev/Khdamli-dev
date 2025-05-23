import express, { Router } from "express";
import dotenv from "dotenv";
import createRequest from "../../controller/jobRequestController/createRequest";
import validateJobRequest from "../../middleware/validateJobRequest";
import deleteRequest from "../../controller/jobRequestController/deleteRequest";
import modifyRequest from "../../controller/jobRequestController/modifyRequest";
import { uploadMedia } from "../../controller/upload/uploadMedia";
import { updateRequestStatus } from "../../controller/jobRequestController/updateRequestStatus";
import selectWorker from "../../controller/jobRequestController/selectWorker";
import createComment from "../../controller/jobRequestController/createComment";
import getRequestMessages from "../../controller/jobRequestController/getRequestMessages";
import getRequestDetails from "../../controller/jobRequestController/getRequestDetails";
import checkRole from "../../middleware/checkRole";
import getRequests from "../../controller/jobRequestController/getRequests";
import getPublicRequests from "../../controller/jobRequestController/getPublicRequests";
import modifyPublicRequestStatus from "../../controller/jobRequestController/modifyPublicRequestStatus";
import modifyComment from "../../controller/jobRequestController/modifyComment";
import deleteComment from "../../controller/jobRequestController/deleteComment";
import markCompleted from "../../controller/jobRequestController/markCompleted";

const request: Router = express.Router();

dotenv.config();
const clientRoleId = Number(process.env.CLIENT_ROLE_ID);
const workerRoleId = Number(process.env.WORKER_ROLE_ID);

request.post("/", checkRole([clientRoleId]), validateJobRequest, createRequest);
// this route used to get private and public requests for a client or a worker

request.get("/:requestId", getRequestDetails);

request.delete("/:requestId",deleteRequest);

request.put("/:requestId", checkRole([clientRoleId]), modifyRequest);

request.put("/media/:requestId", checkRole([clientRoleId]), uploadMedia);

request.put("/status/:requestId", checkRole([workerRoleId]), updateRequestStatus);

// this route is used to select worker in public request
request.put("/:requestId/select-worker/:workerId", checkRole([clientRoleId]), selectWorker);

// this route is used to make a comment on public request
request.post("/:requestId/comment", checkRole([workerRoleId]), createComment);

request.put("/:requestId/comment",checkRole([workerRoleId]) , modifyComment);

request.delete("/:requestId/comment", checkRole([workerRoleId]), deleteComment);

request.get("/:requestId/messages", getRequestMessages);

request.get("/", getRequests);

request.get("/public/:id",getPublicRequests);

// this route is used to allow worker accept or reject public request that he choosen on it
request.put('/:requestId/public-request/status', checkRole([workerRoleId]), modifyPublicRequestStatus);

request.post("/:requestId/complete", checkRole([clientRoleId]), markCompleted);

export default request;