import express, { Router } from "express";
import {
  sendOTP,
  verifyOTP,
} from "../../controller/profile/handlePasswordReset";
import updateProfile from "../../controller/profile/updateProfile";
import assignAddress from "../../middleware/assignAddress";
import role from "./role";
import { canSendOTP } from "../../middleware/canSendOTP";

const update: Router = express.Router();

update.post("/user-info", assignAddress, updateProfile);
update.post("/password-reset/request", canSendOTP, sendOTP); // Request OTP for password reset
update.post("/password-reset/verify", verifyOTP);
update.use("/role", role);

export default update;
