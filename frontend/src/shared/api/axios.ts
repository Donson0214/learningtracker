import axios from "axios";

export const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  timeout: 10000,
});

type RefreshHandler = () => Promise<string | null>;

let refreshHandler: RefreshHandler | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const setAuthRefreshHandler = (handler: RefreshHandler | null) => {
  refreshHandler = handler;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    if (!config || error?.response?.status !== 401 || !refreshHandler) {
      return Promise.reject(error);
    }

    if ((config as { _retry?: boolean })._retry) {
      return Promise.reject(error);
    }

    (config as { _retry?: boolean })._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshHandler();
      }
      const nextToken = await refreshPromise;
      refreshPromise = null;

      if (nextToken) {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${nextToken}`,
        };
        return apiClient.request(config);
      }
    } catch (refreshError) {
      refreshPromise = null;
      return Promise.reject(refreshError);
    }

    return Promise.reject(error);
  }
);
