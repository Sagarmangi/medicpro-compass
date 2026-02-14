import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  type AuthUser,
  verifyMagicLink,
  checkSession,
  logoutSession,
  saveSession,
  getStoredSession,
  clearSession,
  isSessionExpired,
} from '@/lib/auth';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  state: AuthState;
  user: AuthUser | null;
  logout: () => void;
  /** Error from token verification to show on login page */
  tokenError: string | null;
  clearTokenError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setAuthenticated = useCallback((u: AuthUser) => {
    setUser(u);
    setState('authenticated');
    setTokenError(null);
  }, []);

  const setUnauthenticated = useCallback(() => {
    clearSession();
    setUser(null);
    setState('unauthenticated');
  }, []);

  const logout = useCallback(() => {
    const stored = getStoredSession();
    // Fire and forget — instant UX
    if (stored) logoutSession(stored.sessionId).catch(() => {});
    setUnauthenticated();
  }, [setUnauthenticated]);

  // Periodic session check
  const startSessionCheck = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      const stored = getStoredSession();
      if (!stored) { setUnauthenticated(); return; }
      if (isSessionExpired(stored.expiresAt)) {
        toast.error('Your session has expired. Please sign in again.');
        setUnauthenticated();
        return;
      }
      try {
        const res = await checkSession(stored.sessionId);
        if (!res.success || !res.authenticated) {
          toast.error(res.error || 'Session expired. Please sign in again.');
          setUnauthenticated();
        }
      } catch {
        // Network error — don't log out
        toast.error('Connection error. Retrying…');
      }
    }, 300000); // 5 minutes
  }, [setUnauthenticated]);

  useEffect(() => {
    const init = async () => {
      // 1. Check for token in URL (priority)
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (token) {
        // Clean URL immediately
        window.history.replaceState({}, '', window.location.pathname);
        try {
          const res = await verifyMagicLink(token);
          if (res.success && res.session_id && res.user && res.expires_at) {
            saveSession(res.session_id, res.user, res.expires_at);
            setAuthenticated(res.user);
            startSessionCheck();
            return;
          }
          setTokenError(res.error || 'Invalid or expired link');
          setUnauthenticated();
        } catch {
          setTokenError('Network error verifying link. Please try again.');
          setUnauthenticated();
        }
        return;
      }

      // 2. Check stored session
      const stored = getStoredSession();
      if (!stored) { setState('unauthenticated'); return; }

      if (isSessionExpired(stored.expiresAt)) {
        setUnauthenticated();
        return;
      }

      try {
        const res = await checkSession(stored.sessionId);
        if (res.success && res.authenticated && res.user) {
          setAuthenticated(res.user);
          startSessionCheck();
        } else {
          setUnauthenticated();
        }
      } catch {
        // Network error on init — trust local session
        setAuthenticated(stored.user);
        startSessionCheck();
      }
    };

    init();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ state, user, logout, tokenError, clearTokenError: () => setTokenError(null) }}>
      {children}
    </AuthContext.Provider>
  );
}
