import api from "../../config/api";
import { getToken } from "../../utils/storage";

// Submit a new service request
export const submitRequest = async (serviceId, applicantDetails, documents) => {
  const token = getToken();

  const response = await api.post(
    "/requests",
    {
      serviceId,
      applicantDetails,
      documents,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Get all my requests (citizen only)
export const getMyRequests = async () => {
  const token = getToken();

  const response = await api.get("/citizen/requests", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const createComplaint = async (requestId, subject, description) => {
  const token = getToken();
  const response = await api.post(
    "/complaints",
    { requestId, subject, description },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return response.data;
};

export const updateMyRequest = async (requestId, applicantDetails) => {
  const response = await api.patch(
    `/citizen/requests/${requestId}`,
    { applicantDetails },
    { headers: { Authorization: `Bearer ${getToken()}` } },
  );
  return response.data;
};

export const uploadRequestDocument = async (requestId, file, documentId) => {
  const formData = new FormData();
  formData.append('document', file);
  if (documentId) formData.append('documentId', documentId);
  const response = await api.post(
    `/citizen/requests/${requestId}/documents`,
    formData,
    { headers: { Authorization: `Bearer ${getToken()}` } },
  );
  return response.data;
};

export const downloadRequestDocument = async (documentPath) => {
  const filename = documentPath.split('/').pop();
  const response = await api.get(`/request-documents/${encodeURIComponent(filename)}`, {
    responseType: 'blob',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};
