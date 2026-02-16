import { User } from '../types';

const USER_STORAGE_KEY = 'krishi_net_user';
const USERS_DB_KEY = 'krishi_net_users_db';

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

// Returns the OTP code for UI display (Simulation)
export const sendOTP = async (identifier: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[Krishi-Net SMS Gateway] OTP for ${identifier}: ${otp}`);
  return otp; 
};

export const verifyOTP = async (inputOtp: string, sentOtp: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return inputOtp === sentOtp;
};

export const loginWithGoogle = async (): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const user: User = {
    id: 'google_' + Date.now(),
    name: 'Google User',
    phone: '',
    email: 'user@gmail.com',
    location: 'New Delhi, India',
    state: 'Delhi',
    joinedDate: new Date().toISOString()
  };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
};

export const checkUserExists = async (identifier: string): Promise<boolean> => {
  const dbRaw = localStorage.getItem(USERS_DB_KEY);
  const db = dbRaw ? JSON.parse(dbRaw) : {};
  // Check against phone or email
  return Object.values(db).some((u: any) => u.phone === identifier || u.email === identifier);
};

export const loginUser = async (identifier: string): Promise<User> => {
  const dbRaw = localStorage.getItem(USERS_DB_KEY);
  const db = dbRaw ? JSON.parse(dbRaw) : {};
  
  // Find user by phone or email
  const user = Object.values(db).find((u: any) => u.phone === identifier || u.email === identifier) as User;
  
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  } else {
    throw new Error("USER_NOT_FOUND");
  }
};

export const registerUser = async (user: User): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const newUser = { ...user, joinedDate: new Date().toISOString() };

  // Save to "DB"
  const dbRaw = localStorage.getItem(USERS_DB_KEY);
  const db = dbRaw ? JSON.parse(dbRaw) : {};
  
  // Use phone as primary key, or email if phone missing (shouldn't happen in flow)
  const key = newUser.phone || newUser.email;
  db[key] = newUser;
  
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));

  // Set session
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
};

export const logoutUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const updateUserProfile = async (updatedUser: User): Promise<User> => {
  // Update Session
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  
  // Update DB
  const dbRaw = localStorage.getItem(USERS_DB_KEY);
  if (dbRaw) {
    const db = JSON.parse(dbRaw);
    // Find keys that match this user id to update
    const key = Object.keys(db).find(k => db[k].id === updatedUser.id);
    if (key) {
      db[key] = updatedUser;
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    }
  }
  return updatedUser;
};
