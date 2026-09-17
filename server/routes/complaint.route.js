import express from "express";
import { createComplaint } from "../controllers/complaint.controller.js";
import { authorize, protect } from "../middleware/auth.midleware.js";

const complaintRouter = express.Router();

complaintRouter.post("/complaints", protect, authorize("citizen"), createComplaint);

export default complaintRouter;