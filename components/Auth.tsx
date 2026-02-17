
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/authService';
import { MapPin, Phone, User as UserIcon, Mail, Loader2, Lock, Eye, EyeOff, Check, ShieldCheck, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './Background';
import { useTheme } from '../contexts/ThemeContext';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthView = 'LOGIN' | 'REGISTER';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<AuthView>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register State
  const [regData, setRegData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    state: '',
    password: '',
    agreeTerms: false
  });

  // Helper: Password Strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const strength = getPasswordStrength(regData.password);

  // Actions
  const handleLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);

      // Set a safety timeout for geolocation
      const geoTimeout = setTimeout(() => {
        setLoading(false);
        setError("Location request timed out. Please enter manually.");
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(geoTimeout);
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            const loc = [data.city, data.principalSubdivision, data.countryName].filter(Boolean).join(', ');
            setRegData(prev => ({ ...prev, location: loc, state: data.principalSubdivision }));
          } catch (err) {
            setRegData(prev => ({ ...prev, location: `${position.coords.latitude}, ${position.coords.longitude}` }));
          } finally {
            setLoading(false);
          }
        },
        () => {
          clearTimeout(geoTimeout);
          setLoading(false);
          setError("Location permission denied.");
        },
        { timeout: 8000 }
      );
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginUser(identifier, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!regData.name || !regData.phone || !regData.password) return setError("Required fields missing");
    if (regData.password.length < 8) return setError("Password must be at least 8 characters");
    if (!regData.agreeTerms) return setError("Please agree to Terms & Conditions");

    setLoading(true);
    try {
      const user = await registerUser(regData);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
      <Background mode={theme === 'dark' ? 'night' : 'day'} />

      {/* Theme Toggle - Premium Floating Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-4 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-2xl text-yellow-500 dark:text-blue-400"
      >
        {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </motion.button>

      <motion.div
        layout
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Decorative Orbs */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-green-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/20 blur-3xl animate-pulse" />

        <div className={`backdrop-blur-[40px] w-full rounded-[3rem] shadow-[0_32px_120px_rgba(0,0,0,0.3)] border-2 transition-all duration-500 overflow-hidden ${theme === 'dark'
            ? 'bg-black/60 border-white/10 shadow-black'
            : 'bg-white/80 border-white/50 shadow-green-100'
          }`}>

          {/* Header */}
          <div className="p-10 pb-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              delay={0.2}
              className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-green-500/20 mb-6"
            >
              <ShieldCheck className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className={`text-4xl font-black tracking-tight mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Krishi-Net</h1>
            <p className="text-green-500 font-black text-xs uppercase tracking-[0.3em]">Smart AI Agriculture</p>
          </div>

          <div className="p-10 pt-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -10 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-bold mb-8 flex items-center gap-3 backdrop-blur-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {view === 'LOGIN' && (
                <motion.form
                  key="login"
                  initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-6"
                >
                  <div className="group relative">
                    <UserIcon className="absolute left-5 top-5 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Phone or Email"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      className={`w-full pl-14 pr-5 py-5 rounded-2xl font-bold border-2 outline-none transition-all ${theme === 'dark'
                          ? 'bg-white/5 border-transparent focus:bg-white/10 focus:border-green-500 text-white placeholder-gray-500'
                          : 'bg-gray-50 border-transparent focus:bg-white focus:border-green-500 text-gray-900 placeholder-gray-400'
                        }`}
                    />
                  </div>

                  <div className="group relative">
                    <Lock className="absolute left-5 top-5 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`w-full pl-14 pr-14 py-5 rounded-2xl font-bold border-2 outline-none transition-all ${theme === 'dark'
                          ? 'bg-white/5 border-transparent focus:bg-white/10 focus:border-green-500 text-white placeholder-gray-500'
                          : 'bg-gray-50 border-transparent focus:bg-white focus:border-green-500 text-gray-900 placeholder-gray-400'
                        }`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-5 text-gray-400 hover:text-green-500 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-green-500/20 hover:shadow-green-500/40 active:scale-[0.98] transition-all flex justify-center items-center gap-3 overflow-hidden group"
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <Loader2 className="animate-spin w-6 h-6" />
                        </motion.div>
                      ) : (
                        <motion.span key="text" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                          SIGN IN
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  <p className={`text-center text-sm font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    New here? <button type="button" onClick={() => setView('REGISTER')} className="text-green-500 font-black hover:underline underline-offset-4">Create Account</button>
                  </p>
                </motion.form>
              )}

              {view === 'REGISTER' && (
                <motion.form
                  key="register"
                  initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group relative">
                      <UserIcon className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Name"
                        value={regData.name}
                        onChange={e => setRegData({ ...regData, name: e.target.value })}
                        className={`w-full pl-11 pr-4 py-4 rounded-xl text-sm font-bold outline-none border transition-all ${theme === 'dark' ? 'bg-white/5 border-transparent focus:border-green-500 text-white' : 'bg-gray-50 border-transparent focus:border-green-500'
                          }`}
                      />
                    </div>
                    <div className="group relative">
                      <Phone className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={regData.phone}
                        onChange={e => setRegData({ ...regData, phone: e.target.value })}
                        className={`w-full pl-11 pr-4 py-4 rounded-xl text-sm font-bold outline-none border transition-all ${theme === 'dark' ? 'bg-white/5 border-transparent focus:border-green-500 text-white' : 'bg-gray-50 border-transparent focus:border-green-500'
                          }`}
                      />
                    </div>
                  </div>

                  <div className="group relative">
                    <Mail className="absolute left-5 top-4.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email (Optional)"
                      value={regData.email}
                      onChange={e => setRegData({ ...regData, email: e.target.value })}
                      className={`w-full pl-14 pr-5 py-4 rounded-xl font-bold border transition-all ${theme === 'dark' ? 'bg-white/5 border-transparent focus:border-green-500 text-white' : 'bg-gray-50 border-transparent focus:border-green-500'
                        }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="group relative">
                      <Lock className="absolute left-5 top-4.5 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create Password"
                        value={regData.password}
                        onChange={e => setRegData({ ...regData, password: e.target.value })}
                        className={`w-full pl-14 pr-14 py-4 rounded-xl font-bold border transition-all ${theme === 'dark' ? 'bg-white/5 border-transparent focus:border-green-500 text-white' : 'bg-gray-50 border-transparent focus:border-green-500'
                          }`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-4.5 text-gray-400">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    <div className="flex gap-2 h-1.5 px-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i <= strength ? (strength < 2 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : strength < 4 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]') : 'bg-gray-200 dark:bg-gray-800'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="group relative flex-1">
                      <MapPin className="absolute left-5 top-4.5 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Location"
                        value={regData.location}
                        onChange={e => setRegData({ ...regData, location: e.target.value })}
                        className={`w-full pl-14 pr-5 py-4 rounded-xl font-bold border transition-all ${theme === 'dark' ? 'bg-white/5 border-transparent focus:border-green-500 text-white' : 'bg-gray-50 border-transparent focus:border-green-500'
                          }`}
                      />
                    </div>
                    <button type="button" onClick={handleLocation} className="p-4 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20 transition-all active:scale-95 shadow-lg shadow-green-500/5">
                      {loading ? <Loader2 className="animate-spin" /> : <MapPin />}
                    </button>
                  </div>

                  <label className="flex items-center gap-4 p-2 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${regData.agreeTerms ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/30' : 'border-gray-300 dark:border-gray-700'}`}>
                      {regData.agreeTerms && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={regData.agreeTerms} onChange={e => setRegData({ ...regData, agreeTerms: e.target.checked })} />
                    <span className={`text-sm font-bold transition-colors ${theme === 'dark' ? 'text-gray-400 group-hover:text-white' : 'text-gray-500'}`}>Agree to <span className="text-green-500">Terms & Conditions</span></span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-green-500/20 hover:shadow-green-500/40 active:scale-[0.98] transition-all flex justify-center items-center"
                  >
                    {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'CREATE ACCOUNT'}
                  </button>

                  <p className={`text-center text-sm font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Already have an account? <button type="button" onClick={() => setView('LOGIN')} className="text-green-500 font-black hover:underline underline-offset-4">Sign In</button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Simple Alert Component Replacement
const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export default Auth;
