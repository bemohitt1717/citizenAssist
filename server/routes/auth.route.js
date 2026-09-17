import express from "express"
import {
  forgotPin,
  getMe,
  getProfile,
  googleAuth,
  linkGoogle,
  linkMobile,
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
authRouter.post("/auth/google", googleAuth);
authRouter.post("/auth/link-mobile", protect, linkMobile);
authRouter.post("/auth/link-google", protect, linkGoogle);
authRouter.get("/auth/profile", protect, getProfile);
authRouter.patch("/auth/profile", protect, updateProfile);
authRouter.get("/auth/me", protect, getMe)

export default authRouter