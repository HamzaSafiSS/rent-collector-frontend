import axios from 'axios';
import i18n from '../i18n/i18n';

// ── Base instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,  // Required: sends HttpOnly refreshToken cookie on every request
  headers: {
    'Content-Type': 'application/json',
  },
});

let getAccessToken = () => null;

export function setTokenGetter(fn) {
  getAccessToken = fn;
}

// ── Token readiness mechanism ────────────────────────────────────────────────
// When the UI renders instantly from cache but the access token hasn't been
// obtained yet (background refresh in progress), API calls need to wait
// for the token rather than firing without auth and getting 401s.
let tokenReadyResolve = null;
let tokenReadyPromise = null;
let isTokenReady = false;

export function markTokenReady() {
  isTokenReady = true;
  if (tokenReadyResolve) {
    tokenReadyResolve();
    tokenReadyResolve = null;
    tokenReadyPromise = null;
  }
}

export function markTokenPending() {
  if (!isTokenReady) return; // already pending
  isTokenReady = false;
  tokenReadyPromise = null;
  tokenReadyResolve = null;
}

function waitForToken(timeoutMs = 5000) {
  if (isTokenReady) return Promise.resolve();
  if (!tokenReadyPromise) {
    tokenReadyPromise = new Promise((resolve) => {
      tokenReadyResolve = resolve;
      // Safety timeout — don't wait forever
      setTimeout(() => {
        resolve();
        isTokenReady = true;
      }, timeoutMs);
    });
  }
  return tokenReadyPromise;
}

// ── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    // For auth endpoints, don't wait for token
    const isAuthEndpoint = config.url?.includes('/auth/refresh')
                        || config.url?.includes('/auth/login')
                        || config.url?.includes('/auth/signup');

    if (!isAuthEndpoint && !isTokenReady) {
      // Wait for the background refresh to complete before sending the request
      await waitForToken();
    }

    const token = getAccessToken();
    if (token && !config.url?.includes('/auth/refresh')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Send current language to backend for localized responses
    config.headers['Accept-Language'] = i18n.language || 'en';
    return config;
  },
  (error) => Promise.reject(error)
);


let isRefreshing = false;

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
        markTokenReady();
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