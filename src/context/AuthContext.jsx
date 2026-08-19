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
} from '../api/axios';
import api from '../api/axios';

// ── Create context ────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Session storage key for cached user profile ──────────────────────────────
const USER_CACHE_KEY = 'rc_user_profile';

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
    try { sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(profile)); } catch {}
  }
}

function getCachedUser() {
  try {
    const cached = sessionStorage.getItem(USER_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch { return null; }
}

function clearCachedUser() {
  try { sessionStorage.removeItem(USER_CACHE_KEY); } catch {}
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading]         = useState(true);

  // Use a ref so the Axios interceptor always has the latest token
  // without needing a re-render or a new reference
  const tokenRef = useRef(null);

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

useEffect(() => {
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
        clearCachedUser();
        setLoading(false);
        return;
      }

      const data     = await response.json();
      const newToken = data?.data?.accessToken;

      if (!newToken) {
        clearCachedUser();
        setLoading(false);
        return;
      }

      tokenRef.current = newToken;
      setAccessToken(newToken);

      // ── OPTIMIZED: Try cached user first, only fetch /users/me if no cache ──
      const cached = getCachedUser();
      if (cached) {
        // Update role from the fresh token (in case it changed)
        cached.role = getRoleFromToken(newToken);
        setUser(cached);
      } else {
        // No cache — must fetch profile (only happens on first visit or after cache clear)
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

    if (data.mustChangePassword) {
      setUser({ status: 'PendingPasswordChange', role: data.role });
      return {
        mustChangePassword: data.mustChangePassword,
        role: data.role,
      };
    }

    // ── OPTIMIZED: Use login response data directly — NO /users/me call ──
    // The backend now returns all needed profile fields in the login response.
    const profile = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      status: data.status,
      role: data.role,
    };
    cacheUser(profile);
    setUser(profile);

    return {
      mustChangePassword: data.mustChangePassword,
      role: data.role,
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

    // ── OPTIMIZED: Use signup response data directly — NO /users/me call ──
    const profile = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      status: data.status,
      role: data.role,
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
    isAuthenticated: !!accessToken,
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