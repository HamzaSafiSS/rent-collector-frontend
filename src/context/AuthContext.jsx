import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  setTokenGetter,
  setTokenSetter,
  setLogoutCallback,
  markTokenReady,
} from '../api/axios';
import api from '../api/axios';

// ── Create context ────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Session storage key for cached user profile ──────────────────────────────
const USER_CACHE_KEY = 'rc_user_profile';
// Marker that tells us the user was previously logged in (survives page refresh)
const SESSION_MARKER_KEY = 'rc_has_session';

// ── Helper to extract role from JWT ──────────────────────────────────────────
function getRoleFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    let role = payload.role || payload.roles || '';
    if (Array.isArray(role)) role = role[0];
    return role.replace('ROLE_', '').toUpperCase();
  } catch (e) {
    return null;
  }
}

// ── Helper to cache user profile ─────────────────────────────────────────────
function cacheUser(profile) {
  if (profile) {
    try {
      sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(profile));
      // Use localStorage so the marker survives browser restarts
      localStorage.setItem(SESSION_MARKER_KEY, '1');
    } catch {}
  }
}

function getCachedUser() {
  try {
    const cached = sessionStorage.getItem(USER_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch { return null; }
}

function hadPreviousSession() {
  try {
    // Use localStorage so the marker survives browser restarts
    // (sessionStorage is cleared when the browser is closed)
    return localStorage.getItem(SESSION_MARKER_KEY) === '1';
  } catch { return false; }
}

function clearCachedUser() {
  try {
    sessionStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem(SESSION_MARKER_KEY);
  } catch {}
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // ── OPTIMIZATION: Instantly restore cached user on mount ──────────────────
  // This lets ProtectedRoute render the layout IMMEDIATELY for returning users
  // instead of blocking the entire UI with a spinner while we refresh the token.
  const cachedUser = getCachedUser();

  const [user, setUser]               = useState(cachedUser);
  const [accessToken, setAccessToken] = useState(null);

  // ── OPTIMIZATION: If we have cached user data, don't block the UI ─────────
  // - Returning users (have cache): loading = false → UI renders immediately
  // - New/logged-out users (no cache but had session): loading = true → brief spinner
  // - First-time visitors (no cache, no session marker): loading = false → go to login
  const [loading, setLoading] = useState(() => {
    if (cachedUser) return false;          // Returning user → instant UI
    if (hadPreviousSession()) return true; // Had session but cache cleared → wait briefly
    return false;                          // Never logged in → go to login immediately
  });

  // Use a ref so the Axios interceptor always has the latest token
  // without needing a re-render or a new reference
  const tokenRef = useRef(null);

  // ── Guard against React.StrictMode double-mount ──────────────────────────
  // In development, StrictMode runs useEffect twice. Without this guard,
  // trySilentRefresh() would fire twice, causing the second call to try
  // rotating an already-revoked refresh token (which fails with 401).
  const refreshCalledRef = useRef(false);

  // ── Wire up Axios interceptors ──────────────────────────────────────────────
  // Called once on mount — connects the Axios instance to this context
  useEffect(() => {
    // Getter: Axios reads the token from the ref on every request
    setTokenGetter(() => tokenRef.current);

    // Setter: Axios calls this when a new token is received after refresh
    setTokenSetter((newToken) => {
      tokenRef.current = newToken;
      setAccessToken(newToken);
    });

    // Logout callback: called when refresh fails
    setLogoutCallback(() => {
      tokenRef.current = null;
      setAccessToken(null);
      setUser(null);
      clearCachedUser();
    });
  }, []);

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  // ── Silent refresh on mount ─────────────────────────────────────────────────
  // For returning users: the UI is already visible (loading=false, user=cached).
  // This runs in the background to get a fresh access token.
  // For new visitors: loading is already false, so they go straight to login.
  useEffect(() => {
    // Guard against StrictMode double-fire
    if (refreshCalledRef.current) return;
    refreshCalledRef.current = true;

    async function trySilentRefresh() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/auth/refresh`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          // No valid refresh token — user is not logged in
          clearCachedUser();
          setUser(null);
          setAccessToken(null);
          setLoading(false);
          return;
        }

        const data     = await response.json();
        const newToken = data?.data?.accessToken;

        if (!newToken) {
          clearCachedUser();
          setUser(null);
          setAccessToken(null);
          setLoading(false);
          return;
        }

        tokenRef.current = newToken;
        setAccessToken(newToken);
        markTokenReady();

        // If we already have a cached user, just update the role from the fresh token
        const cached = getCachedUser();
        if (cached) {
          cached.role = getRoleFromToken(newToken);
          cacheUser(cached);
          setUser(cached);
        } else {
          // No cache — must fetch profile (first login in this tab)
          try {
            const profileRes = await fetch(
              `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/users/me`,
              {
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${newToken}`,
                },
              }
            );

            if (profileRes.ok) {
              const profileData = await profileRes.json();
              const profile = profileData?.data;
              if (profile) {
                profile.role = getRoleFromToken(newToken);
                cacheUser(profile);
              }
              setUser(profile);
            }
          } catch {
          }
        }
      } catch {
        clearCachedUser();
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    }

    trySilentRefresh();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const data     = response.data?.data;

    tokenRef.current = data.accessToken;
    setAccessToken(data.accessToken);
    markTokenReady();

    const actualRole = getRoleFromToken(data.accessToken) || (data.role ? data.role.replace('ROLE_', '').toUpperCase() : '');

    if (data.mustChangePassword) {
      setUser({ status: 'PendingPasswordChange', role: actualRole });
      return {
        mustChangePassword: data.mustChangePassword,
        role: actualRole,
      };
    }

    // ── Use login response data directly — NO /users/me call needed ──
    const profile = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      status: data.status,
      role: actualRole,
    };
    cacheUser(profile);
    setUser(profile);

    return {
      mustChangePassword: data.mustChangePassword,
      role: actualRole,
    };
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if logout fails on the server, clear client state
    } finally {
      tokenRef.current = null;
      setAccessToken(null);
      setUser(null);
      clearCachedUser();
    }
  }, []);

  // ── Signup (Landlord only) ─────────────────────────────────────────────────
  const signup = useCallback(async (fullName, email, password, phoneNumber) => {
    const response = await api.post('/auth/signup', {
      fullName,
      email,
      password,
      phoneNumber,
    });
    const data = response.data?.data;

    tokenRef.current = data.accessToken;
    setAccessToken(data.accessToken);
    markTokenReady();

    const actualRole = getRoleFromToken(data.accessToken) || (data.role ? data.role.replace('ROLE_', '').toUpperCase() : '');

    // ── Use signup response data directly — NO /users/me call needed ──
    const profile = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      status: data.status,
      role: actualRole,
    };
    cacheUser(profile);
    setUser(profile);

    return data;
  }, []);

  // ── Update user in context (e.g. after profile edit) ──────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const profileRes = await api.get('/users/me');
      const profile = profileRes.data?.data;
      if (profile) {
        profile.role = getRoleFromToken(tokenRef.current);
        cacheUser(profile);
      }
      setUser(profile);
    } catch {
      // Silently ignore
    }
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user,  // ← Changed: user presence = authenticated (not just token)
    login,
    logout,
    signup,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}