import express from "express"
import serviceRouter from "./service.route.js";
import requestRouter from "./request.route.js";
import authRouter from "./auth.route.js";
import agentRouter from "./agent.route.js";
import adminRouter from "./admin.route.js";
import complaintRouter from "./complaint.route.js";

const router = express.Router();

router.use("/api", serviceRouter);
router.use("/api", requestRouter);
router.use("/api", authRouter);
router.use("/api", agentRouter);
router.use("/api", adminRouter);
router.use("/api", complaintRouter);

export default router;