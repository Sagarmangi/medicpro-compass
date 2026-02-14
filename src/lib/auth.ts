const AUTH_URL = import.meta.env.VITE_AUTH_URL;

const SESSION_KEYS = {
  sessionId: 'medicpro_session_id',
  user: 'medicpro_user',
  expires: 'medicpro_session_expires',
} as const;

export interface AuthUser {
  email: string;
  name: string;
  role: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  session_id?: string;
  user?: AuthUser;
  expires_at?: string;
  authenticated?: boolean;
}

async function authCall(action: string, params: Record<string, string> = {}): Promise<AuthResponse> {
  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  });
  return response.json();
}

export async function requestMagicLink(email: string) {
  return authCall('request_magic_link', { email });
}

export async function verifyMagicLink(token: string) {
  return authCall('verify_magic_link', { token });
}

export async function checkSession(sessionId: string) {
  return authCall('check_session', { session_id: sessionId });
}

export async function logoutSession(sessionId: string) {
  return authCall('logout', { session_id: sessionId });
}

// localStorage helpers
export function saveSession(sessionId: string, user: AuthUser, expiresAt: string) {
  localStorage.setItem(SESSION_KEYS.sessionId, sessionId);
  localStorage.setItem(SESSION_KEYS.user, JSON.stringify(user));
  localStorage.setItem(SESSION_KEYS.expires, expiresAt);
}

export function getStoredSession() {
  const sessionId = localStorage.getItem(SESSION_KEYS.sessionId);
  const userStr = localStorage.getItem(SESSION_KEYS.user);
  const expires = localStorage.getItem(SESSION_KEYS.expires);
  if (!sessionId || !userStr || !expires) return null;
  try {
    return { sessionId, user: JSON.parse(userStr) as AuthUser, expiresAt: expires };
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEYS.sessionId);
  localStorage.removeItem(SESSION_KEYS.user);
  localStorage.removeItem(SESSION_KEYS.expires);
}

export function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt) <= new Date();
}
