import express, { Router } from "express";
import signup from "./signup";
import address from "./address";
import jobRequestRoutes from "./jobRequest";
import category from "./categorySelection";
import payment from "./paymentSelection";
import workingHours from "./workingHours";

const mainRouter: Router = express.Router();

mainRouter.use("/signup", signup);
mainRouter.use("/address", address);
mainRouter.use("/job-request", jobRequestRoutes);
mainRouter.use("/category", category);
mainRouter.use("/payment", payment);
mainRouter.use("/working-hours", workingHours);
export default mainRouter;
