
import { User } from '../types';

// Use Vite environment variable for API URL or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const USER_STORAGE_KEY = 'krishi_net_user';
const TOKEN_STORAGE_KEY = 'krishi_net_token';

// Helper to map Backend User (snake_case) -> Frontend User (camelCase)
const mapBackendUser = (backendUser: any): User => {
  return {
    id: backendUser.id,
    name: backendUser.name || backendUser.full_name || 'Farmer', // Handle both formats
    email: backendUser.email || '',
    phone: backendUser.phone || '',
    // Polyfill missing fields
    location: backendUser.location || 'India',
    state: backendUser.state || 'Madhya Pradesh',
    joinedDate: backendUser.joined_date || new Date().toISOString(),
    // Handle boolean logic for onboarding
    isOnboarded: typeof backendUser.isOnboarded === 'boolean'
      ? backendUser.isOnboarded
      : (backendUser.is_onboarded || false)
  };
};

export const getCurrentUser = (): User | null => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!storedUser || !storedToken) {
    if (storedUser) logoutUser(); // Clean up partial state
    return null;
  }

  try {
    const parsed = JSON.parse(storedUser);

    // Validate critical fields - if name is missing but full_name exists, migrate it
    if (!parsed.name && parsed.full_name) {
      console.log("Auto-fixing corrupted user data from storage...");
      const fixed = mapBackendUser(parsed);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fixed)); // Save fix
      return fixed;
    }

    // If name is totally missing, treat as invalid/logged out
    if (!parsed.name) {
      console.warn("Invalid user data in storage (missing name), clearing session.");
      logoutUser();
      return null;
    }

    return parsed;
  } catch (e) {
    console.error("Error parsing user from storage:", e);
    logoutUser(); // Clear bad data
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.location.reload(); // Force reload to clear React state
};

// Simulation of sending OTP (Nolonger used in UI but kept for compatibility or future use)
export const sendOTP = async (identifier: string): Promise<void> => {
  console.log("OTP requested for:", identifier);
  // OTP is now handled/bypassed on backend
};

export const verifyOTP = async (identifier: string, inputOtp: string): Promise<boolean> => {
  // OTP is bypassed
  return true;
};

export const checkUserExists = async (identifier: string): Promise<boolean> => {
  return false; // Always allow signup attempt, let backend handle duplicate error
};

// LOGIN: Connects to Real Backend
export const loginUser = async (identifier: string, password?: string): Promise<User> => {
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
    const user = mapBackendUser(data.user); // Transform

    // Save Token & User
    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    return user;
  } catch (error: any) {
    console.error("Login Error:", error);
    throw error;
  }
};

// REGISTER: Connects to Real Backend (Auto-Verifies)
export const registerUser = async (userData: any): Promise<User> => {
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

    // Auto-login after signup (Backend now returns token)
    if (data.access_token) {
      const user = mapBackendUser(data.user); // Transform

      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    } else {
      // Fallback (should not happen with new backend logic)
      throw new Error("Registration successful but no token received.");
    }

  } catch (error: any) {
    console.error("Registration Error:", error);
    throw error;
  }
};

export const completeOnboarding = async (user: User): Promise<User> => {
  const updatedUser = { ...user, isOnboarded: true };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser)); // Update local state
  return updatedUser;
};


export const updateUserProfile = async (updatedUser: User): Promise<User> => {
  // Local update only for demo, ideally would sync to backend
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};
