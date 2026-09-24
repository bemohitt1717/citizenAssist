import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
	addAgentRequestNote,
	applyAsAgent,
	decideAgentRequest,
	getAgentDashboard,
	getAgentEarnings,
	getAgentProfile,
	getAgentRequests,
	updateAgentProfile,
	updateAgentRequestStatus,
	uploadAgentRequestDocument,
} from "../controllers/agent.controller.js";
import { authorize, protect } from "../middleware/auth.midleware.js";

const agentRouter = express.Router();
const upload = multer({
	storage: multer.diskStorage({
		destination: (_req, _file, callback) => {
			const directory = path.resolve("uploads");
			fs.mkdirSync(directory, { recursive: true });
			callback(null, directory);
		},
		filename: (_req, file, callback) => {
			const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
			callback(null, `${Date.now()}-${safeName}`);
		},
	}),
	limits: { fileSize: 10 * 1024 * 1024 },
	fileFilter: (_req, file, callback) => {
		const extension = path.extname(file.originalname).toLowerCase();
		const supported = new Set([".pdf", ".jpg", ".jpeg", ".png"]);
		callback(supported.has(extension) ? null : new Error("Only PDF, JPG and PNG documents are accepted."), supported.has(extension));
	},
});

// Apply to become an agent (citizen only)
agentRouter.post("/agents/apply", protect, authorize("citizen"), applyAsAgent);

agentRouter.use("/agent", protect, authorize("agent"));
agentRouter.get("/agent/profile", getAgentProfile);
agentRouter.patch("/agent/profile", updateAgentProfile);
agentRouter.get("/agent/dashboard", getAgentDashboard);
agentRouter.get("/agent/earnings", getAgentEarnings);
agentRouter.get("/agent/requests", getAgentRequests);
agentRouter.patch("/agent/requests/:id/decision", decideAgentRequest);
agentRouter.patch("/agent/requests/:id/status", updateAgentRequestStatus);
agentRouter.post("/agent/requests/:id/notes", addAgentRequestNote);
agentRouter.post("/agent/requests/:id/document", upload.single("document"), uploadAgentRequestDocument);

export default agentRouter;
