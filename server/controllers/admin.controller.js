import Agent from "../model/agent.js";
import ServiceRequest from "../model/serviceRequest.js";
import User from "../model/user.js";
import Complaint from "../model/complaint.js";
import Service from "../model/service.js";
import bcrypt from "bcrypt";
import { randomInt } from "node:crypto";

const generateAgentPin = () => {
  let pin;
  do {
    pin = String(randomInt(1000, 10000));
  } while (["0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "1234", "4321"].includes(pin));
  return pin;
};

// Get admin dashboard stats
export const getAdminDashboard = async (req, res, next) => {
  try {
    console.log('📊 [ADMIN] Fetching dashboard stats');

    // Count citizens
    const citizens = await User.countDocuments({ role: "citizen" });

    // Count agents
    const agents = await Agent.countDocuments();

    // Count pending agents
    const pendingAgents = await Agent.countDocuments({ verificationStatus: "pending" });

    // Count active requests (not completed/rejected/cancelled)
    const activeRequests = await ServiceRequest.countDocuments({
      status: { $in: ["pending", "assigned", "review", "processing", "action"] },
    });

    // Count completed requests
    const completedRequests = await ServiceRequest.countDocuments({ status: "completed" });

    // Count open complaints
    const openComplaints = await Complaint.countDocuments({ status: "open" });

    console.log('✅ [SUCCESS] Dashboard stats:', {
      citizens,
      agents,
      pendingAgents,
      activeRequests,
      completedRequests,
      openComplaints,
    });

    return res.json({
      status: "success",
      data: {
        counts: {
          citizens,
          agents,
          pendingAgents,
          activeRequests,
          completedRequests,
          openComplaints,
        },
      },
    });
  } catch (error) {
    console.error('❌ [ERROR] Dashboard fetch failed:', error);
    next(error);
  }
};

// Get admin profile
export const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user._id);

    return res.json({
      status: "success",
      data: {
        profile: {
          name: admin.name || "Platform Admin",
          phone: admin.phone,
          email: admin.email || "",
          since: admin.createdAt.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Name is required.",
      });
    }

    await User.findByIdAndUpdate(req.user._id, { name: name.trim() });

    return res.json({
      status: "success",
      message: "Profile updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Get all agents (with filter by status)
export const getAgents = async (req, res, next) => {
  try {
    const { status } = req.query; // pending, active, rejected, suspended

    console.log('👥 [ADMIN] Fetching agents, filter:', status || 'all');

    const filter = {};
    if (status && ["pending", "active", "rejected", "suspended"].includes(status)) {
      filter.verificationStatus = status;
    }

    const agents = await Agent.find(filter)
      .populate("user", "name phone email createdAt")
      .sort({ appliedAt: -1 });

    console.log(`✅ [ADMIN] Found ${agents.length} agents`);

    // Format for frontend
    const formattedAgents = agents.map((agent) => ({
      id: agent._id,
      name: agent.name,
      district: agent.district,
      phone: agent.phone,
      email: agent.email,
      experience: agent.experience,
      services: agent.services.length,
      status: agent.verificationStatus,
      appliedAt: agent.appliedAt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      completed: agent.completedRequests,
      rating: agent.rating > 0 ? agent.rating.toFixed(1) : null,
    }));

    return res.json({
      status: "success",
      count: formattedAgents.length,
      data: {
        agents: formattedAgents,
      },
    });
  } catch (error) {
    console.error('❌ [ADMIN] Failed to fetch agents:', error);
    next(error);
  }
};

// Verify or reject agent
export const updateAgentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // active, rejected, suspended

    console.log(`🔄 [ADMIN] Updating agent ${id} status to:`, status);

    if (!["active", "rejected", "suspended"].includes(status)) {
      console.log('❌ [ADMIN] Invalid status:', status);
      return res.status(400).json({
        status: "error",
        message: "Invalid status. Use: active, rejected, or suspended.",
      });
    }

    const agent = await Agent.findById(id);

    if (!agent) {
      console.log('❌ [ADMIN] Agent not found:', id);
      return res.status(404).json({
        status: "error",
        message: "Agent not found.",
      });
    }

    // Update agent status
    agent.verificationStatus = status;

    if (status === "active") {
      agent.verifiedOn = new Date();
      console.log('✅ [ADMIN] Agent verified, setting verifiedOn timestamp');
    }

    await agent.save();

    // Update user status
    const userStatus = status === "active" ? "active" : status;
    const userRole = status === "active" ? "agent" : "citizen";
    const userUpdate = { status: userStatus, role: userRole };
    let issuedPin;

    if (status === "active") {
      issuedPin = generateAgentPin();
      userUpdate.pinHash = await bcrypt.hash(issuedPin, 12);
      userUpdate.failedPinAttempts = 0;
      userUpdate.lastFailedAttempt = null;
      userUpdate.lockedUntil = null;
    }

    await User.findByIdAndUpdate(agent.user, userUpdate);

    console.log(`✅ [ADMIN] Agent status updated: ${status}, User status synced`);

    return res.json({
      status: "success",
      message: `Agent ${status === "active" ? "verified" : status} successfully.`,
      data: issuedPin ? { pin: issuedPin, mobile: agent.phone } : undefined,
    });
  } catch (error) {
    console.error('❌ [ADMIN] Failed to update agent status:', error);
    next(error);
  }
};

// Get all service requests (admin view)
export const getAdminRequests = async (req, res, next) => {
  try {
    const { status } = req.query;

    console.log('📋 [ADMIN] Fetching requests, filter:', status || 'all');

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const requests = await ServiceRequest.find(filter)
      .populate("citizen", "name phone")
      .populate("agent", "name")
      .sort({ createdAt: -1 });

    console.log(`✅ [ADMIN] Found ${requests.length} requests`);

    // Format for frontend
    const formattedRequests = requests.map((request) => ({
      id: request._id,
      reference: request.reference,
      serviceId: request.serviceId,
      citizen: request.citizen?.name || request.applicantDetails.fullName,
      district: request.applicantDetails.district,
      agentName: request.agentName,
      status: request.status,
      charge: request.charge,
      createdAt: request.createdAt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }));

    return res.json({
      status: "success",
      count: formattedRequests.length,
      data: {
        requests: formattedRequests,
      },
    });
  } catch (error) {
    console.error('❌ [ADMIN] Failed to fetch requests:', error);
    next(error);
  }
};

// Assign agent to request
export const assignAgentToRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    console.log(`🔗 [ADMIN] Assigning agent ${agentId} to request ${id}`);

    if (!agentId) {
      console.log('❌ [ADMIN] Agent ID missing');
      return res.status(400).json({
        status: "error",
        message: "Agent ID is required.",
      });
    }

    const request = await ServiceRequest.findById(id);

    if (!request) {
      console.log('❌ [ADMIN] Request not found:', id);
      return res.status(404).json({
        status: "error",
        message: "Request not found.",
      });
    }

    const agent = await Agent.findById(agentId).populate("user", "name");

    if (!agent || agent.verificationStatus !== "active") {
      console.log('❌ [ADMIN] Agent not found or not active:', agentId);
      return res.status(404).json({
        status: "error",
        message: "Agent not found or not active.",
      });
    }

    console.log(`✅ [ADMIN] Found agent: ${agent.name}`);

    // Update request
    request.agent = agentId;
    request.agentName = agent.name;
    request.status = "assigned";

    // Add timeline entry
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    request.timeline.push({
      status: "assigned",
      at: formattedDate,
      note: `Assigned to agent ${agent.name}.`,
    });

    await request.save();

    // Update agent stats
    agent.totalRequests += 1;
    await agent.save();

    console.log(`✅ [ADMIN] Assignment complete. Timeline updated, agent stats incremented`);

    return res.json({
      status: "success",
      message: "Agent assigned successfully.",
    });
  } catch (error) {
    console.error('❌ [ADMIN] Assignment failed:', error);
    next(error);
  }
};

// Get all complaints
export const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate("citizen", "name phone")
      .populate("request", "reference")
      .sort({ createdAt: -1 });

    // Format for frontend
    const formattedComplaints = complaints.map((complaint) => ({
      id: complaint._id,
      reference: `CP-${complaint._id.toString().slice(-3)}`,
      requestRef: complaint.request?.reference || "N/A",
      citizen: complaint.citizen?.name || "Unknown",
      against: complaint.against || null,
      subject: complaint.subject,
      detail: complaint.description,
      status: complaint.status,
      raisedAt: complaint.createdAt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      resolution: complaint.adminResponse || null,
    }));

    return res.json({
      status: "success",
      count: formattedComplaints.length,
      data: {
        complaints: formattedComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Resolve complaint
export const resolveComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    if (!resolution || resolution.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Resolution is required.",
      });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        status: "error",
        message: "Complaint not found.",
      });
    }

    complaint.status = "resolved";
    complaint.adminResponse = resolution.trim();
    await complaint.save();

    return res.json({
      status: "success",
      message: "Complaint resolved successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Get all services
export const getServices = async (req, res, next) => {
  try {
    console.log('🛠️ [ADMIN-SERVICES] Fetching all services');

    const services = await Service.find().sort({ serviceId: 1 });

    console.log(`✅ [ADMIN-SERVICES] Found ${services.length} services`);

    // Format for frontend
    const formattedServices = services.map((service) => ({
      id: service._id,
      serviceId: service.serviceId,
      name: service.name,
      charge: service.charge,
      timeline: service.timeline,
      summary: service.summary,
      documents: service.requiredDocuments,
      isActive: service.isActive,
    }));

    return res.json({
      status: "success",
      count: formattedServices.length,
      data: {
        services: formattedServices,
      },
    });
  } catch (error) {
    console.error('❌ [ADMIN-SERVICES] Failed to fetch services:', error);
    next(error);
  }
};

// Update service
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { charge, timeline, summary } = req.body;

    console.log(`🔄 [ADMIN-SERVICES] Updating service ${id}:`, { charge, timeline, summary });

    // Validate required fields
    if (!charge || !timeline || !summary) {
      console.log('❌ [ADMIN-SERVICES] Missing required fields');
      return res.status(400).json({
        status: "error",
        message: "Charge, timeline, and summary are required.",
      });
    }

    const service = await Service.findById(id);

    if (!service) {
      console.log('❌ [ADMIN-SERVICES] Service not found:', id);
      return res.status(404).json({
        status: "error",
        message: "Service not found.",
      });
    }

    // Update fields
    service.charge = charge.trim();
    service.timeline = timeline.trim();
    service.summary = summary.trim();

    await service.save();

    console.log(`✅ [ADMIN-SERVICES] Service updated: ${service.name}`);

    return res.json({
      status: "success",
      message: "Service updated successfully.",
    });
  } catch (error) {
    console.error('❌ [ADMIN-SERVICES] Update failed:', error);
    next(error);
  }
};
