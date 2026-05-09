import axios from "axios";
// import { decryptData } from "./decryptData";

// -------------------------------------------------------------
//  Axios Instance
// - Base API configuration
// - Automatically applies base URL & default headers
// -------------------------------------------------------------
const BASE_URL = import.meta.env.VITE_BACKEND_API;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
    // Connection: "keep-alive",
    // Connection: "close",
  },
  withCredentials: true, // Required if backend uses cookies
});

const triggerForcedLogout = (reason) => {
  console.warn(reason);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-unauthorized"));
};

// -------------------------------------------------------------
//  Dynamic Base URL Interceptor
// - Injects tenant subdomain on all authenticated requests
// -------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    // Ensure auth endpoints use the default base URL
    if (
      config.url &&
      (config.url.includes("/login") || config.url.includes("/register"))
    ) {
      config.baseURL = BASE_URL;
      return config;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
//  Global Response Interceptor
// - Handles 401 Unauthorized errors to automatically log out
// -------------------------------------------------------------
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "";
    const normalizedMessage = String(errorMessage).toLowerCase();

    if (status === 401) {
      triggerForcedLogout(
        "Unauthorized request or token expired. Logging out."
      );
    }

    if (
      normalizedMessage.includes("tenant could not be identified on domain")
    ) {
      triggerForcedLogout(
        "Tenant could not be identified on domain. Logging out."
      );
    }

    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
//  Get Auth Token From SessionStorage
// - Decrypts saved authData
// - Returns Authorization header if token exists
// -------------------------------------------------------------
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};

  try {
    return { Authorization: `Bearer ${token}` };
  } catch (err) {
    console.error("❌ Token retrieval failed:", err);
    return {};
  }
};

// ------------------- Generic Methods -------------------

// -------------------------------------------------------------
//  GENERIC GET METHOD
// - Supports params
// - Auto attaches Authorization header
// -------------------------------------------------------------
export const getData = async (endPoint, params = {}) => {
  try {
    const response = await api.get(endPoint, {
      params,
      headers: {
        ...getAuthHeader(),
        "Access-Control-Allow-Origin": "*",
      },
    });

    return response.data;
  } catch (error) {
    console.error("API GET Error:", error);
    throw error;
  }
};
// -------------------------------------------------------------
//  GENERIC POST METHOD
// -------------------------------------------------------------
export const postData = async (endPoint, data, config = {}) => {
  const response = await api.post(endPoint, data, {
    ...config,
    headers: {
      ...getAuthHeader(),
      ...(config.headers || {}),
      "Access-Control-Allow-Origin": "*",
    },
    credentials: "include"

  });
  return response.data;
};
// -------------------------------------------------------------
// GENERIC PUT METHOD
// -------------------------------------------------------------
export const putData = async (endPoint, data, config = {}) => {
  const response = await api.put(endPoint, data, {
    ...config,
    headers: {
      ...getAuthHeader(),
      ...(config.headers || {}),
    },
  });
  return response.data;
};

// -------------------------------------------------------------
//  GENERIC DELETE METHOD
// -------------------------------------------------------------
export const deleteData = async (endPoint, config = {}) => {
  const response = await api.delete(endPoint, {
    ...config,
    headers: {
      ...getAuthHeader(),
      ...(config.headers || {}),
    },
  });
  return response.data;
};

// Export Axios instance
export default api;