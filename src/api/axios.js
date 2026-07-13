import axios from 'axios';

// ── Base instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  withCredentials: true,  // Required: sends HttpOnly refreshToken cookie on every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach access token ─────────────────────────────────
// Reads the access token from memory (stored in AuthContext, not localStorage).
// We use a getter function instead of importing AuthContext directly to avoid
// circular dependency issues.
let getAccessToken = () => null;

export function setTokenGetter(fn) {
  getAccessToken = fn;
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
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
  // Success — pass through
  (response) => response,

  // Error — handle 401
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401 errors that haven't been retried yet
    // Also skip the /auth/refresh endpoint itself to avoid infinite loops
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Another refresh is already in progress — queue this request
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
        // Call refresh — cookie is sent automatically (withCredentials: true)
        const response = await api.post('/auth/refresh');
        const newToken = response.data?.data?.accessToken;

        if (!newToken) throw new Error('No access token in refresh response');

        // Update the in-memory token via AuthContext setter
        setAccessToken(newToken);

        // Update the Authorization header for the retry
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        // Resolve all queued requests with the new token
        processQueue(null, newToken);

        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed — session is truly expired
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