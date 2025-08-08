import axios from "axios";

// Resolve API base URL from window.ENV (client) or process.env (server)
const resolveApiUrl = (): string => {
  if (typeof window !== "undefined") {
    return (window as any).ENV?.API_URL || import.meta.env?.VITE_API_URL || "";
  }
  return process.env.API_URL || "";
};

// Configure global axios defaults
axios.defaults.baseURL = resolveApiUrl();
axios.defaults.headers.common["Accept"] = "application/json";

// Attach a request interceptor to inject the Bearer token and content-type
axios.interceptors.request.use(
  (config) => {
    try {
      // Ensure JSON content-type by default if not set
      if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
        config.headers["Content-Type"] = "application/json";
      }

      // Add Authorization if not explicitly provided per-request
      const hasAuthHeader = Boolean(
        (config.headers &&
          (config.headers["Authorization"] ||
            config.headers["authorization"])) ||
          false
      );
      if (!hasAuthHeader && typeof window !== "undefined") {
        const token = window.localStorage?.getItem("accessToken");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      }
    } catch (_) {
      // noop
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      // Optionally clear token
      try {
        window.localStorage.removeItem("accessToken");
      } catch {}
      window.location.href = "/logout";
    }
    return Promise.reject(error);
  }
);

export {}; // make this a module
