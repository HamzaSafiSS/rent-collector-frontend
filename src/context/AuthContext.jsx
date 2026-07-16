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
    });
  }, []);

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

useEffect(() => {
  async function trySilentRefresh() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/auth/refresh`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data     = await response.json();
      const newToken = data?.data?.accessToken;

      if (!newToken) {
        setLoading(false);
        return;
      }

      tokenRef.current = newToken;
      setAccessToken(newToken);

      try {
        const profileRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/users/me`,
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
          setUser(profileData?.data);
        }
      } catch {
      }

    } catch {
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

    // Load full user profile
    const profileRes = await api.get('/users/me');
    const profile    = profileRes.data?.data;

    if (profile) {
      profile.role = getRoleFromToken(data.accessToken);
    }
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

    const profileRes = await api.get('/users/me');
    const profile = profileRes.data?.data;
    if (profile) {
      profile.role = getRoleFromToken(data.accessToken);
    }
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