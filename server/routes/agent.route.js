import express from "express";
import uploadDocument from "../middleware/documentUpload.middleware.js";
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
agentRouter.post("/agent/requests/:id/document", uploadDocument.single("document"), uploadAgentRequestDocument);

export default agentRouter;
