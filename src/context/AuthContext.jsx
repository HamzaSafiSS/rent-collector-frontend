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

  // ── Sync tokenRef whenever accessToken state changes ──────────────────────
  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  // ── On app load — attempt silent refresh ───────────────────────────────────
  // If the user has a valid refresh token cookie from a previous session,
  // this silently gets a new access token and restores their session.
  // If not, they just stay logged out — no redirect.
  useEffect(() => {
    async function trySilentRefresh() {
      try {
        const response = await api.post('/auth/refresh');
        const newToken = response.data?.data?.accessToken;

        if (newToken) {
          tokenRef.current = newToken;
          setAccessToken(newToken);

          // Load the user's profile with the new token
          const profileRes = await api.get('/users/me', {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          setUser(profileRes.data?.data);
        }
      } catch {
        // No valid refresh token — user is not logged in, that's fine
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

    // Load full user profile
    const profileRes = await api.get('/users/me');
    const profile    = profileRes.data?.data;

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
    setUser(profileRes.data?.data);

    return data;
  }, []);

  // ── Update user in context (e.g. after profile edit) ──────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const profileRes = await api.get('/users/me');
      setUser(profileRes.data?.data);
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