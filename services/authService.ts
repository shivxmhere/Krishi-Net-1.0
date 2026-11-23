
import { User } from '../types';

// Use Vite environment variable for API URL or fallback to localhost
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

const USER_STORAGE_KEY = 'krishi_net_user';
const TOKEN_STORAGE_KEY = 'krishi_net_token';
const LOCAL_USERS_KEY = 'krishi_net_local_users';

// Helper to map Backend User (snake_case) -> Frontend User (camelCase)
const mapBackendUser = (backendUser: any): User => {
  return {
    id: backendUser.id,
    name: backendUser.name || backendUser.full_name || 'Farmer',
    email: backendUser.email || '',
    phone: backendUser.phone || '',
    location: backendUser.location || 'India',
    state: backendUser.state || 'Madhya Pradesh',
    joinedDate: backendUser.joined_date || new Date().toISOString(),
    isOnboarded: typeof backendUser.isOnboarded === 'boolean'
      ? backendUser.isOnboarded
      : (backendUser.is_onboarded || false)
  };
};

// ── Check if an error is a network error (backend unreachable) ──
function isNetworkError(error: any): boolean {
  return (
    error instanceof TypeError &&
    (error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Network request failed'))
  );
}

export const getCurrentUser = (): User | null => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!storedUser || !storedToken || storedToken.startsWith('offline_token_')) {
    if (storedUser) logoutUser();
    return null;
  }

  try {
    const parsed = JSON.parse(storedUser);

    if (!parsed.name && parsed.full_name) {
      console.log("Auto-fixing corrupted user data from storage...");
      const fixed = mapBackendUser(parsed);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fixed));
      return fixed;
    }

    if (!parsed.name) {
      console.warn("Invalid user data in storage (missing name), clearing session.");
      logoutUser();
      return null;
    }

    return parsed;
  } catch (e) {
    console.error("Error parsing user from storage:", e);
    logoutUser();
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.location.reload();
};

// OTP stubs (not used in current UI)
export const sendOTP = async (_identifier: string): Promise<void> => { };
export const verifyOTP = async (_identifier: string, _inputOtp: string): Promise<boolean> => true;
export const checkUserExists = async (_identifier: string): Promise<boolean> => false;

// ════════════════════════════════════════════════════════════════
// LOGIN — tries backend first, falls back to local auth
// ════════════════════════════════════════════════════════════════
export const loginUser = async (identifier: string, password?: string): Promise<User> => {
  // 1. Try real backend
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: identifier.includes('@') ? identifier : undefined,
        phone: identifier.includes('@') ? undefined : identifier,
        password: password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    const user = mapBackendUser(data.user);

    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;

  } catch (error: any) {
    // 2. If it's a network error → fall back to local auth
    if (isNetworkError(error)) {
      console.log("🔄 Backend unreachable — using offline authentication");
      throw new Error('Backend unavailable. Please try again when connected.');
    }
    // Otherwise re-throw (e.g. wrong password from backend)
    throw error;
  }
};

// ════════════════════════════════════════════════════════════════
// REGISTER — tries backend first, falls back to local
// ════════════════════════════════════════════════════════════════
export const registerUser = async (userData: any): Promise<User> => {
  // 1. Try real backend
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    const data = await response.json();

    if (data.access_token) {
      const user = mapBackendUser(data.user);
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    } else {
      throw new Error("Registration successful but no token received.");
    }

  } catch (error: any) {
    // 2. If it's a network error → fall back to local registration
    if (isNetworkError(error)) {
      console.log("🔄 Backend unreachable — using offline registration");
      throw new Error('Backend unavailable. Registration needs a server connection.');
    }
    throw error;
  }
};

// ════════════════════════════════════════════════════════════════
// PROFILE & ONBOARDING
// ════════════════════════════════════════════════════════════════

async function updateServerProfile(payload: object): Promise<User> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token || token.startsWith('offline_token_')) throw new Error('Please sign in again');
  const response = await fetch(`${API_URL}/api/v1/auth/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || 'Failed to update your account');
  const user = mapBackendUser(body);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

export const completeOnboarding = async (_user: User): Promise<User> =>
  updateServerProfile({ is_onboarded: true });

export const updateUserProfile = async (user: User): Promise<User> =>
  updateServerProfile({ full_name: user.name, location: user.location });

export const restoreSession = async (): Promise<User | null> => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token || token.startsWith('offline_token_')) return null;
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error('Session invalid');
    const user = mapBackendUser(await response.json());
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  } catch {
    // Fail closed: offline sessions cannot authorize access to server-owned data.
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
};
