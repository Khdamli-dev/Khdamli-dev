import express, { Router } from "express";
import getPaymentMethods from "../utils/payment/getPaymentMethods";
import addWorkerPayment from "../controller/profile/addWorkerPayment";
import validatePaymentSelection from "../middleware/validatePaymentSelection";

const payment: Router = express.Router();

// Endpoint to fetch all available payment methods
payment.get("/get-payment", getPaymentMethods);

// Endpoint to add selected payment methods for a worker
payment.post("/add-payment", validatePaymentSelection, addWorkerPayment);

export default payment;
