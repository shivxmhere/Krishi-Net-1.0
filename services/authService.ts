
import { User } from '../types';

// Use Vite environment variable for API URL or fallback to localhost
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

const USER_STORAGE_KEY = 'krishi_net_user';
const TOKEN_STORAGE_KEY = 'krishi_net_token';
const LOCAL_USERS_KEY = 'krishi_net_local_users';

// ── Lightweight password hashing for offline mode (SHA-256) ──
async function hashPasswordLocal(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_krishi_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Local user store helpers ──
interface LocalUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  state: string;
  passwordHash: string;
  joinedDate: string;
  isOnboarded: boolean;
}

function getLocalUsers(): LocalUserRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUserRecord[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function generateLocalId(): string {
  return 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

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

  if (!storedUser || !storedToken) {
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
      return loginUserLocal(identifier, password || '');
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
      return registerUserLocal(userData);
    }
    throw error;
  }
};

// ════════════════════════════════════════════════════════════════
// LOCAL (OFFLINE) AUTH FUNCTIONS
// ════════════════════════════════════════════════════════════════

async function loginUserLocal(identifier: string, password: string): Promise<User> {
  const localUsers = getLocalUsers();
  const passwordHash = await hashPasswordLocal(password);

  const found = localUsers.find(u =>
    (u.phone === identifier || u.email === identifier) && u.passwordHash === passwordHash
  );

  if (!found) {
    // Check if user exists at all (for better error message)
    const userExists = localUsers.find(u => u.phone === identifier || u.email === identifier);
    if (userExists) {
      throw new Error("Incorrect password. Please try again.");
    }
    throw new Error("No account found. Please sign up first.");
  }

  const user: User = {
    id: found.id,
    name: found.name,
    email: found.email,
    phone: found.phone,
    location: found.location,
    state: found.state,
    joinedDate: found.joinedDate,
    isOnboarded: found.isOnboarded,
  };

  // Save session
  localStorage.setItem(TOKEN_STORAGE_KEY, 'offline_token_' + found.id);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

async function registerUserLocal(userData: any): Promise<User> {
  const localUsers = getLocalUsers();
  const passwordHash = await hashPasswordLocal(userData.password);

  // Check for duplicate
  const exists = localUsers.find(u =>
    (userData.phone && u.phone === userData.phone) ||
    (userData.email && u.email === userData.email)
  );

  if (exists) {
    throw new Error("An account with this phone/email already exists. Please sign in.");
  }

  const newId = generateLocalId();
  const record: LocalUserRecord = {
    id: newId,
    name: userData.name,
    email: userData.email || '',
    phone: userData.phone || '',
    location: userData.location || 'India',
    state: userData.state || '',
    passwordHash,
    joinedDate: new Date().toISOString(),
    isOnboarded: false,
  };

  localUsers.push(record);
  saveLocalUsers(localUsers);

  const user: User = {
    id: newId,
    name: record.name,
    email: record.email,
    phone: record.phone,
    location: record.location,
    state: record.state,
    joinedDate: record.joinedDate,
    isOnboarded: false,
  };

  localStorage.setItem(TOKEN_STORAGE_KEY, 'offline_token_' + newId);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

// ════════════════════════════════════════════════════════════════
// PROFILE & ONBOARDING
// ════════════════════════════════════════════════════════════════

export const completeOnboarding = async (user: User): Promise<User> => {
  const updatedUser = { ...user, isOnboarded: true };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

  // Also update local user record if exists
  const localUsers = getLocalUsers();
  const idx = localUsers.findIndex(u => u.id === user.id);
  if (idx >= 0) {
    localUsers[idx].isOnboarded = true;
    saveLocalUsers(localUsers);
  }

  return updatedUser;
};

export const updateUserProfile = async (updatedUser: User): Promise<User> => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};
