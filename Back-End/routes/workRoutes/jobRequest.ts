import express, { Router } from "express";
import createRequest from "../../controller/jobRequestController/createRequest";
import validateJobRequest from "../../middleware/validateJobRequest";
import getPrivateRequest from "../../controller/jobRequestController/getPrivateRequest";
import getPublicRequest from "../../controller/jobRequestController/getPublicRequest";
import getPublicRequestsForWorker from "../../controller/jobRequestController/getPublicRequestForWorker";

const request: Router = express.Router();

request.post("/create", validateJobRequest, createRequest);
// this route used to get private requests for a client or a worker
request.get("/get/private", getPrivateRequest);
// this route used to get public requests of client
request.get("/get/public/:client", getPublicRequest);
// New endpoint for workers
request.post("/get/public", getPublicRequestsForWorker); // Add auth middleware if you have one

export default request;
