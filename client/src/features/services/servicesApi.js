import api from "../../config/api";
import { getToken } from "../../utils/storage";

let publicServicesCache = null;
let publicServicesCacheUntil = 0;

/**
 * Shared service APIs for both admin and agents
 */

// Get all services (public + admin)
export const getAllServices = async ({ signal } = {}) => {
  if (publicServicesCache && Date.now() < publicServicesCacheUntil) {
    return publicServicesCache;
  }

  const response = await api.get("/services", { signal, timeout: 6500 });
  publicServicesCache = response.data;
  publicServicesCacheUntil = Date.now() + 30_000;
  return response.data;
};

// Get single service by ID
export const getServiceById = async (serviceId) => {
  const response = await api.get(`/services/${serviceId}`);
  return response.data;
};

// Admin: Update service (charge, timeline, summary)
export const updateService = async (serviceId, data) => {
  const token = getToken();
  const response = await api.patch(
    `/admin/services/${serviceId}`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  publicServicesCache = null;
  publicServicesCacheUntil = 0;
  return response.data;
};

// Admin: Get all services (same as getAllServices but with auth)
export const getAdminServices = async () => {
  const token = getToken();
  const response = await api.get("/admin/services", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
