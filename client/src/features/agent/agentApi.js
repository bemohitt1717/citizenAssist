import api from "../../config/api";
import { getToken } from "../../utils/storage";

// Apply to become an agent
export const applyAsAgent = async (applicationData) => {
  const token = getToken();

  const response = await api.post(
    "/agents/apply",
    {
      name: applicationData.fullName,
      mobile: applicationData.mobile, // Send mobile number
      email: applicationData.email,
      district: applicationData.district,
      experience: applicationData.experience,
      services: applicationData.services,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const authConfig = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

let agentDashboardRequest;

export const getAgentProfile = async () => {
  const response = await api.get("/agent/profile", authConfig());
  return response.data;
};

export const updateAgentProfile = async (profile) => {
  const response = await api.patch("/agent/profile", profile, authConfig());
  return response.data;
};

export const getAgentDashboard = async () => {
  if (!agentDashboardRequest) {
    agentDashboardRequest = api
      .get("/agent/dashboard", authConfig())
      .then((response) => response.data)
      .finally(() => {
        agentDashboardRequest = null;
      });
  }

  return agentDashboardRequest;
};

export const getAgentEarnings = async () => {
  const response = await api.get("/agent/earnings", authConfig());
  return response.data;
};

export const getAgentRequests = async (status = "all") => {
  const response = await api.get(`/agent/requests?status=${status}`, authConfig());
  return response.data;
};

export const decideAgentRequest = async (requestId, decision) => {
  const response = await api.patch(
    `/agent/requests/${requestId}/decision`,
    { decision },
    authConfig(),
  );
  return response.data;
};

export const updateAgentRequestStatus = async (requestId, status) => {
  const response = await api.patch(
    `/agent/requests/${requestId}/status`,
    { status },
    authConfig(),
  );
  return response.data;
};

export const addAgentRequestNote = async (requestId, note) => {
  const response = await api.post(
    `/agent/requests/${requestId}/notes`,
    { note },
    authConfig(),
  );
  return response.data;
};

export const uploadAgentRequestDocument = async (requestId, file) => {
  const formData = new FormData();
  formData.append('document', file);
  const response = await api.post(
    `/agent/requests/${requestId}/document`,
    formData,
    authConfig(),
  );
  return response.data;
};

export const downloadRequestDocument = async (documentPath) => {
  const filename = documentPath.split('/').pop();
  const response = await api.get(`/request-documents/${encodeURIComponent(filename)}`, {
    ...authConfig(),
    responseType: 'blob',
  });
  return response.data;
};
