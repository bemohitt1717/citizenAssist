import api from "../../config/api";
import { getToken } from "../../utils/storage";

// Get admin dashboard stats
export const getAdminDashboard = async () => {
  const token = getToken();
  const response = await api.get("/admin/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get admin profile
export const getAdminProfile = async () => {
  const token = getToken();
  const response = await api.get("/admin/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Update admin profile
export const updateAdminProfile = async (name) => {
  const token = getToken();
  const response = await api.patch(
    "/admin/profile",
    { name },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Get all agents (with optional status filter)
export const getAgents = async (status) => {
  const token = getToken();
  const url = status ? `/admin/agents?status=${status}` : "/admin/agents";
  const response = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Verify, reject, or suspend agent
export const updateAgentStatus = async (agentId, status) => {
  const token = getToken();
  const response = await api.patch(
    `/admin/agents/${agentId}`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Get all service requests
export const getAdminRequests = async (status) => {
  const token = getToken();
  const url = status ? `/admin/requests?status=${status}` : "/admin/requests";
  const response = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Assign agent to request
export const assignAgent = async (requestId, agentId) => {
  const token = getToken();
  const response = await api.patch(
    `/admin/requests/${requestId}/assign`,
    { agentId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Get all complaints
export const getComplaints = async () => {
  const token = getToken();
  const response = await api.get("/admin/complaints", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Resolve complaint
export const resolveComplaint = async (complaintId, resolution) => {
  const token = getToken();
  const response = await api.patch(
    `/admin/complaints/${complaintId}`,
    { resolution },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
