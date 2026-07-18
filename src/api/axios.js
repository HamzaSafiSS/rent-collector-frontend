import axios from 'axios';

// ── Base instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  withCredentials: true,  // Required: sends HttpOnly refreshToken cookie on every request
  headers: {
    'Content-Type': 'application/json',
  },
});

let getAccessToken = () => null;

export function setTokenGetter(fn) {
  getAccessToken = fn;
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.url?.includes('/auth/refresh')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 and auto-refresh ───────────────────────
// When any request gets a 401 (access token expired), this interceptor:
// 1. Calls POST /auth/refresh (the HttpOnly cookie is sent automatically)
// 2. Updates the in-memory access token via the setter
// 3. Retries the original failed request with the new token
// 4. If refresh itself fails (401 again), redirects to /login

let isRefreshing = false;

// Queue of requests that arrived while a refresh was already in progress.
// They all wait for the new token, then retry together.
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

// Setter called by AuthContext when it gets a new access token
let setAccessToken = () => {};

export function setTokenSetter(fn) {
  setAccessToken = fn;
}

// Redirect function — called when refresh fails (session fully expired)
let onLogout = () => {
  window.location.href = '/login';
};

export function setLogoutCallback(fn) {
  onLogout = fn;
}
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Skip interceptor for:
    // 1. Requests that already retried
    // 2. The /auth/refresh endpoint itself
    // 3. The /auth/login endpoint
    // 4. Any request that explicitly opts out
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest._skipRefresh
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post('/auth/refresh');
        const newToken = response.data?.data?.accessToken;

        if (!newToken) throw new Error('No access token in refresh response');

        setAccessToken(newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);

        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        onLogout();
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default api;