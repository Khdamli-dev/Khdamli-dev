import express, { Router } from "express";
import signup from "./signup";
import address from "./address";
import jobRequestRoutes from "./jobRequest";
import getCategories from "../utils/category/getCategories";
import category from "./categorySelection";

const mainRouter: Router = express.Router();

mainRouter.use("/signup", signup);
mainRouter.use("/address", address);
mainRouter.use("/job-request", jobRequestRoutes);
mainRouter.use("/category", category);
export default mainRouter;
