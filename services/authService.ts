
import { User } from '../types';

const USER_STORAGE_KEY = 'krishi_net_user';
const USERS_DB_KEY = 'krishi_net_users_db';
const OTP_STORAGE_KEY = 'krishi_net_temp_otp';

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

// Simulation of sending OTP via SMS/Email Provider
export const sendOTP = async (identifier: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // In a real app, this would call your backend API (Twilio/SendGrid)
  // For this demo, we log it to console for the developer
  console.log(`[Krishi-Net Notification Gateway] 📨 OTP sent to ${identifier}: ${otp}`);
  
  // Store OTP temporarily for verification (Simulating server-side session)
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify({ identifier, code: otp, expires: Date.now() + 300000 })); // 5 mins
};

export const verifyOTP = async (identifier: string, inputOtp: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const storedData = localStorage.getItem(OTP_STORAGE_KEY);
  if (!storedData) return false;

  const { identifier: savedId, code, expires } = JSON.parse(storedData);
  
  if (savedId !== identifier) return false;
  if (Date.now() > expires) return false;
  
  if (inputOtp === code) {
    localStorage.removeItem(OTP_STORAGE_KEY);
    return true;
  }
  return false;
};

export const checkUserExists = async (identifier: string): Promise<boolean> => {
  const dbRaw = localStorage.getItem(USERS_DB_KEY);
  const db = dbRaw ? JSON.parse(dbRaw) : {};
  return Object.values(db).some((u: any) => u.phone === identifier || u.email === identifier);
};

export const loginUser = async (identifier: string, password?: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const dbRaw = localStorage.getItem(USERS_DB_KEY);
  const db = dbRaw ? JSON.parse(dbRaw) : {};
  
  // Find user by phone or email
  const user = Object.values(db).find((u: any) => u.phone === identifier || u.email === identifier) as any;
  
  if (!user) {
    throw new Error("Account not found. Please Sign Up.");
  }

  // If password provided, verify it
  if (password && user.password !== password) {
    throw new Error("Incorrect password.");
  }
  
  const { password: _, ...safeUser } = user; // Remove password from session
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(safeUser));
  return safeUser;
};

export const registerUser = async (userData: any): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const newUser = { 
    id: 'user_' + Date.now(),
    name: userData.name,
    phone: userData.phone,
    email: userData.email,
    location: userData.location,
    state: userData.state,
    joinedDate: new Date().toISOString(),
    password: userData.password, // In real app, this must be hashed!
    isOnboarded: false // New users start as not onboarded
  };

  const dbRaw = localStorage.getItem(USERS_DB_KEY);
  const db = dbRaw ? JSON.parse(dbRaw) : {};
  
  const key = newUser.phone || newUser.email;
  db[key] = newUser;
  
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));

  const { password: _, ...safeUser } = newUser;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(safeUser));
  return safeUser;
};

export const completeOnboarding = async (user: User): Promise<User> => {
  const updatedUser = { ...user, isOnboarded: true };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  
  const dbRaw = localStorage.getItem(USERS_DB_KEY);
  if (dbRaw) {
    const db = JSON.parse(dbRaw);
    const key = Object.keys(db).find(k => db[k].id === user.id);
    if (key) {
      db[key] = { ...db[key], isOnboarded: true };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    }
  }
  return updatedUser;
};

export const logoutUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const updateUserProfile = async (updatedUser: User): Promise<User> => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  
  const dbRaw = localStorage.getItem(USERS_DB_KEY);
  if (dbRaw) {
    const db = JSON.parse(dbRaw);
    const key = Object.keys(db).find(k => db[k].id === updatedUser.id);
    if (key) {
      db[key] = { ...db[key], ...updatedUser };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    }
  }
  return updatedUser;
};
