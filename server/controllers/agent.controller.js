import Agent from "../model/agent.js";
import User from "../model/user.js";
import Service from "../model/service.js";
import ServiceRequest from "../model/serviceRequest.js";
import { attachCompletedDocument } from "../utils/attachCompletedDocument.js";

const formatDate = (date) => date.toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatDateTime = (date) => date.toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const getAgentForUser = async (userId) => Agent.findOne({ user: userId });

const moneyValue = (charge) => {
  const value = Number.parseFloat(String(charge || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(value) ? value : 0;
};

const formatMoney = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const formatRequest = (request, requiredDocumentCounts) => ({
  id: request._id,
  reference: request.reference,
  serviceId: request.serviceId,
  status: request.status === "assigned" ? "offered" : request.status,
  citizen: request.applicantDetails.fullName,
  citizenMobile: request.applicantDetails.phone,
  district: request.applicantDetails.district,
  charge: request.charge,
  documentsAttached: request.documents.length,
  documentsRequired: request.documentsRequired ?? requiredDocumentCounts.get(request.serviceId) ?? request.documents.length,
  applicantDetails: request.applicantDetails,
  documents: request.documents,
  completedDocument: request.completedDocument || "",
  updatedAt: formatDate(request.updatedAt),
  lastNote: request.timeline.at(-1)?.note || null,
  createdAt: formatDate(request.createdAt),
  timeline: request.timeline,
});

// Apply to become an agent (citizen only)
export const applyAsAgent = async (req, res, next) => {
  try {
    console.log('👤 [AGENT] Application request:', {
      user: req.user._id,
      body: req.body,
    });

    const { name, mobile, email, district, experience, services } = req.body;

    // Validate required fields
    if (!name || !mobile || !district || !experience || !services || services.length === 0) {
      console.log('❌ [ERROR] Missing required fields');
      return res.status(400).json({
        status: "error",
        message: "Name, mobile, district, experience, and at least one service are required.",
      });
    }

    // Normalize mobile number (add +91 if not present)
    const normalizedMobile = mobile.startsWith('+91') ? mobile : `+91${mobile}`;

    if (!/^\+91[6-9]\d{9}$/.test(normalizedMobile)) {
      return res.status(400).json({ status: "error", message: "Enter a valid Indian mobile number." });
    }

    // Validate: mobile must be different from citizen's phone
    if (normalizedMobile === req.user.phone) {
      console.log('❌ [ERROR] Agent mobile same as citizen phone:', { 
        agentMobile: normalizedMobile, 
        citizenPhone: req.user.phone 
      });
      return res.status(400).json({
        status: "error",
        message: "You cannot use the same mobile number as your citizen account. Please use a different number.",
      });
    }

    // Check if user already has an agent profile
    const existingAgent = await Agent.findOne({ user: req.user._id });

    if (existingAgent) {
      console.log('❌ [ERROR] User already applied:', existingAgent._id);
      return res.status(409).json({
        status: "error",
        message: "You have already applied as an agent.",
      });
    }

    const existingAccount = await User.findOne({ phone: normalizedMobile, _id: { $ne: req.user._id } });
    if (existingAccount) {
      return res.status(409).json({ status: "error", message: "This mobile number is already linked to another account." });
    }

    // Check if mobile number is already used by another agent
    const existingAgentWithMobile = await Agent.findOne({ phone: normalizedMobile });
    
    if (existingAgentWithMobile) {
      console.log('❌ [ERROR] Mobile already used by another agent:', normalizedMobile);
      return res.status(409).json({
        status: "error",
        message: "This mobile number is already registered as an agent.",
      });
    }

    // Create agent profile
    const agent = await Agent.create({
      user: req.user._id,
      name,
      phone: normalizedMobile,
      email: email || "",
      district,
      experience,
      services,
      verificationStatus: "pending",
      appliedAt: new Date(),
    });

    console.log('✅ [SUCCESS] Agent profile created:', agent._id);

    // Update user name if not set (don't change status here - agent is separate role)
    if (!req.user.name) {
      await User.findByIdAndUpdate(req.user._id, { name });
      console.log('✅ [SUCCESS] User name updated');
    }

    return res.status(201).json({
      status: "success",
      message: "Application submitted successfully. An admin will review it soon.",
      data: {
        agent: {
          id: agent._id,
          verificationStatus: agent.verificationStatus,
          appliedAt: agent.appliedAt,
        },
      },
    });
  } catch (error) {
    console.error('❌ [ERROR] Agent application failed:', error);
    next(error);
  }
};

export const getAgentProfile = async (req, res, next) => {
  try {
    const agent = await getAgentForUser(req.user._id);
    if (!agent) return res.status(404).json({ status: "error", message: "Agent profile not found." });

    console.log("👤 [AGENT] Profile loaded:", agent._id.toString());
    return res.json({
      status: "success",
      data: {
        profile: {
          id: agent._id,
          name: agent.name,
          phone: agent.phone,
          email: agent.email,
          district: agent.district,
          experience: agent.experience,
          services: agent.services,
          verificationStatus: agent.verificationStatus,
          verifiedOn: agent.verifiedOn ? formatDate(agent.verifiedOn) : null,
          joinedOn: formatDate(agent.appliedAt),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAgentProfile = async (req, res, next) => {
  try {
    const { name, district, experience, services } = req.body;
    const agent = await getAgentForUser(req.user._id);

    if (!agent) return res.status(404).json({ status: "error", message: "Agent profile not found." });
    if (!name?.trim() || !district?.trim() || !experience || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ status: "error", message: "Name, district, experience, and services are required." });
    }

    agent.name = name.trim();
    agent.district = district.trim();
    agent.experience = experience;
    agent.services = services;
    await agent.save();
    await User.findByIdAndUpdate(req.user._id, { name: agent.name });

    console.log("✏️ [AGENT] Profile updated:", agent._id.toString());
    return res.json({ status: "success", message: "Profile updated successfully." });
  } catch (error) {
    next(error);
  }
};

export const getAgentDashboard = async (req, res, next) => {
  try {
    const agent = await getAgentForUser(req.user._id);
    if (!agent) return res.status(404).json({ status: "error", message: "Agent profile not found." });

    const [pending, active, action, completed] = await Promise.all([
      ServiceRequest.countDocuments({ agent: agent._id, status: "assigned" }),
      ServiceRequest.countDocuments({ agent: agent._id, status: { $in: ["review", "processing"] } }),
      ServiceRequest.countDocuments({ agent: agent._id, status: "action" }),
      ServiceRequest.countDocuments({ agent: agent._id, status: "completed" }),
    ]);

    console.log("📊 [AGENT] Dashboard stats:", { agent: agent._id.toString(), pending, active, action, completed });
    return res.json({ status: "success", data: { counts: { pending, active, action, completed } } });
  } catch (error) {
    next(error);
  }
};

export const getAgentRequests = async (req, res, next) => {
  try {
    const agent = await getAgentForUser(req.user._id);
    if (!agent) return res.status(404).json({ status: "error", message: "Agent profile not found." });

    const filter = { agent: agent._id };
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status === "offered" ? "assigned" : req.query.status;
    }

    const requests = await ServiceRequest.find(filter).sort({ updatedAt: -1 });
    const serviceIds = [...new Set(requests.map((request) => request.serviceId))];
    const services = serviceIds.length
      ? await Service.find({ serviceId: { $in: serviceIds } }).select("serviceId requiredDocuments").lean()
      : [];
    const requiredDocumentCounts = new Map(
      services.map((service) => [service.serviceId, service.requiredDocuments?.length ?? 0])
    );
    console.log(`📋 [AGENT] Loaded ${requests.length} requests for ${agent._id.toString()}`);
    return res.json({
      status: "success",
      count: requests.length,
      data: { requests: requests.map((request) => formatRequest(request, requiredDocumentCounts)) },
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentEarnings = async (req, res, next) => {
  try {
    const agent = await getAgentForUser(req.user._id);
    if (!agent) return res.status(404).json({ status: 'error', message: 'Agent profile not found.' });

    const requests = await ServiceRequest.find({ agent: agent._id, status: 'completed' })
      .sort({ updatedAt: -1 });
    const now = new Date();
    const thisMonthRequests = requests.filter((request) => {
      const completedAt = request.completedAt || request.updatedAt;
      return completedAt.getMonth() === now.getMonth() && completedAt.getFullYear() === now.getFullYear();
    });
    const total = requests.reduce((sum, request) => sum + moneyValue(request.charge), 0);
    const thisMonth = thisMonthRequests.reduce((sum, request) => sum + moneyValue(request.charge), 0);

    const completedRequests = requests.map((request) => ({
      id: request._id,
      reference: request.reference,
      serviceId: request.serviceId,
      serviceName: request.serviceName,
      amount: formatMoney(moneyValue(request.charge)),
      completedAt: formatDate(request.completedAt || request.updatedAt),
    }));

    console.log('💰 [AGENT] Earnings calculated:', {
      agent: agent._id.toString(),
      completed: requests.length,
      total,
    });
    return res.json({
      status: 'success',
      data: {
        thisMonth: formatMoney(thisMonth),
        allTime: formatMoney(total),
        completedThisMonth: thisMonthRequests.length,
        completedRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const decideAgentRequest = async (req, res, next) => {
  try {
    const agent = await getAgentForUser(req.user._id);
    const request = await ServiceRequest.findOne({ _id: req.params.id, agent: agent?._id });
    const { decision } = req.body;

    if (!agent || !request) return res.status(404).json({ status: "error", message: "Assigned request not found." });
    if (request.status !== "assigned") return res.status(400).json({ status: "error", message: "Only newly assigned requests can be decided." });
    if (!["accept", "reject"].includes(decision)) return res.status(400).json({ status: "error", message: "Decision must be accept or reject." });

    const nextStatus = decision === "accept" ? "review" : "pending";
    request.status = nextStatus;
    if (decision === "reject") {
      request.agent = null;
      request.agentName = null;
    }
    request.timeline.push({
      status: nextStatus,
      at: formatDateTime(new Date()),
      note: decision === "accept" ? `Accepted by agent ${agent.name}.` : `Declined by agent ${agent.name}. Returned for reassignment.`,
    });
    await request.save();

    console.log(`🔄 [AGENT] Request ${request.reference} ${decision}ed by ${agent.name}`);
    return res.json({ status: "success", message: `Request ${decision}ed successfully.` });
  } catch (error) {
    next(error);
  }
};

export const updateAgentRequestStatus = async (req, res, next) => {
  try {
    const agent = await getAgentForUser(req.user._id);
    const request = await ServiceRequest.findOne({ _id: req.params.id, agent: agent?._id });
    const { status } = req.body;
    const allowed = ["review", "processing", "action", "completed"];

    if (!agent || !request) return res.status(404).json({ status: "error", message: "Assigned request not found." });
    if (!allowed.includes(status)) return res.status(400).json({ status: "error", message: "Invalid agent status transition." });

    request.status = status;
    if (status === "completed") request.completedAt = new Date();
    request.timeline.push({ status, at: formatDateTime(new Date()), note: `Status updated to ${status}.` });
    await request.save();

    if (status === "completed") {
      await Agent.updateOne({ _id: agent._id }, { $inc: { completedRequests: 1 } });
    }

    console.log(`🔄 [AGENT] Request ${request.reference} moved to ${status}`);
    return res.json({ status: "success", message: "Request status updated successfully." });
  } catch (error) {
    next(error);
  }
};

export const addAgentRequestNote = async (req, res, next) => {
  try {
    const agent = await getAgentForUser(req.user._id);
    const request = await ServiceRequest.findOne({ _id: req.params.id, agent: agent?._id });
    const note = req.body.note?.trim();

    if (!agent || !request) return res.status(404).json({ status: "error", message: "Assigned request not found." });
    if (!note) return res.status(400).json({ status: "error", message: "Note is required." });

    request.status = "action";
    request.timeline.push({ status: "action", at: formatDateTime(new Date()), note });
    await request.save();

    console.log(`📝 [AGENT] Note added to ${request.reference} by ${agent.name}`);
    return res.json({ status: "success", message: "Note sent to citizen." });
  } catch (error) {
    next(error);
  }
};

export const uploadAgentRequestDocument = async (req, res, next) => {
  try {
    const agent = await getAgentForUser(req.user._id);
    const request = await ServiceRequest.findOne({ _id: req.params.id, agent: agent?._id });

    if (!agent || !request) return res.status(404).json({ status: "error", message: "Assigned request not found." });
    const { document, filename } = await attachCompletedDocument({
      request,
      file: req.file,
      userId: req.user._id,
      uploader: "agent",
      at: formatDateTime(new Date()),
    });

    console.log(`📎 [AGENT] Final document uploaded for ${request.reference}: ${filename}`);
    return res.json({
      status: "success",
      message: "Final document uploaded successfully.",
      data: { document },
    });
  } catch (error) {
    next(error);
  }
};
