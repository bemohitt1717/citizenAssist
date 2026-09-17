import express from "express"
import {
  forgotPin,
  getMe,
  getProfile,
  signIn,
  signUp,
  startAuth,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.midleware.js";

const authRouter = express.Router();

authRouter.post("/auth/start", startAuth);
authRouter.post("/auth/sign-up", signUp);
authRouter.post("/auth/sign-in", signIn);
authRouter.post("/auth/forgot-pin", forgotPin);
authRouter.get("/auth/profile", protect, getProfile);
authRouter.patch("/auth/profile", protect, updateProfile);
authRouter.get("/auth/me", protect, getMe)

export default authRouter