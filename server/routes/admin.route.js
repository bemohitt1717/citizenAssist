import express from "express";
import uploadDocument from "../middleware/documentUpload.middleware.js";
import {
  getAdminDashboard,
  getAdminProfile,
  updateAdminProfile,
  getAgents,
  updateAgentStatus,
  getAdminRequests,
  assignAgentToRequest,
  getComplaints,
  resolveComplaint,
  getServices,
  updateService,
  uploadAdminRequestDocument,
} from "../controllers/admin.controller.js";
import { authorize, protect } from "../middleware/auth.midleware.js";

const adminRouter = express.Router();

// All routes are admin-only and protected
adminRouter.use(protect, authorize("admin"));

// Dashboard
adminRouter.get("/admin/dashboard", getAdminDashboard);

// Profile
adminRouter.get("/admin/profile", getAdminProfile);
adminRouter.patch("/admin/profile", updateAdminProfile);

// Agents
adminRouter.get("/admin/agents", getAgents);
adminRouter.patch("/admin/agents/:id", updateAgentStatus);

// Requests
adminRouter.get("/admin/requests", getAdminRequests);
adminRouter.patch("/admin/requests/:id/assign", assignAgentToRequest);
adminRouter.post("/admin/requests/:id/document", uploadDocument.single("document"), uploadAdminRequestDocument);

// Complaints
adminRouter.get("/admin/complaints", getComplaints);
adminRouter.patch("/admin/complaints/:id", resolveComplaint);

// Services
adminRouter.get("/admin/services", getServices);
adminRouter.patch("/admin/services/:id", updateService);

export default adminRouter;
