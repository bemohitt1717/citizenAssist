import api from "../../config/api";
import { getToken } from "../../utils/storage";

export const startAuth = async (phone, role) => {
  const response = await api.post("/auth/start", { phone, role });
  console.info(
    "[auth debug] POST /auth/start",
    response.status,
    response.data.data,
  );
  return response.data;
};

export const signUp = async (phone, pin) => {
  const response = await api.post("/auth/sign-up", { phone, pin });
  console.info("[auth debug] POST /auth/sign-up", response.status, {
    role: response.data.data?.user?.role,
  });
  return response.data;
};

export const signIn = async (phone, pin, role) => {
  const response = await api.post("/auth/sign-in", { phone, pin, role });
  console.info("[auth debug] POST /auth/sign-in", response.status, {
    role: response.data.data?.user?.role,
  });
  return response.data;
};

export const forgotPin = async (phone, pin, role) => {
  const response = await api.post("/auth/forgot-pin", { phone, pin, role });
  console.info("[auth debug] POST /auth/forgot-pin", response.status, {
    role: response.data.data?.user?.role,
  });
  return response.data;
};

export const getProfile = async () => {
  const token = getToken();
  const response = await api.get("/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.info("[auth debug] GET /auth/profile", response.status, {
    role: response.data.data?.profile?.role,
  });
  return response.data;
};

export const updateProfile = async (payload) => {
  const token = getToken();
  const response = await api.patch("/auth/profile", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.info("[auth debug] PATCH /auth/profile", response.status, {
    role: response.data.data?.user?.role,
  });
  return response.data;
};

export const getMe = async () => {
  const token = getToken();
  const response = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.info("[auth debug] GET /auth/me", response.status, {
    role: response.data.data?.user?.role,
  });
  return response.data;
};
