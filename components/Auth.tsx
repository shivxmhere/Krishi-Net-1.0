import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/authService';
import { MapPin, Phone, User as UserIcon, Mail, Loader2, Lock, Eye, EyeOff, Check, ShieldCheck, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import { Background } from './Background';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from './ui/GlassCard';
import { Icons } from './ui/IconSystem';
import { Button } from './ui/Button';

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

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const strength = getPasswordStrength(regData.password);

  const handleLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
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
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background removed */}

      <motion.button
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 10 }} whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-earth-golden dark:text-sky-morning"
      >
        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
      </motion.button>

      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative w-full max-w-md z-10">
        <GlassCard className="p-0 overflow-hidden border-2 border-glass-border">
          <div className="p-10 pb-4 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} delay={0.2} className="w-20 h-20 bg-gradient-to-br from-harvest-green to-leaf-green rounded-3xl mx-auto flex items-center justify-center shadow-glow-green mb-6 text-white">
              <Icons.Logo size={40} />
            </motion.div>
            <h1 className="text-4xl font-display font-bold tracking-tight mb-2 text-deep-earth dark:text-white">Krishi-Net</h1>
            <p className="text-harvest-green dark:text-sprout-green font-bold text-xs uppercase tracking-[0.3em]">Smart AI Agriculture</p>
          </div>

          <div className="p-10 pt-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold mb-6 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {view === 'LOGIN' && (
                <motion.form
                  key="login" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
                  onSubmit={handleLoginSubmit} className="space-y-6"
                >
                  <div className="group relative">
                    <UserIcon className="absolute left-5 top-5 w-5 h-5 text-gray-400 group-focus-within:text-harvest-green transition-colors" />
                    <input
                      type="text" placeholder="Phone or Email" value={identifier} onChange={e => setIdentifier(e.target.value)}
                      className="w-full pl-14 pr-5 py-5 rounded-2xl font-bold bg-white/50 dark:bg-black/20 border-2 border-transparent focus:border-harvest-green/50 outline-none transition-all dark:text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="group relative">
                    <Lock className="absolute left-5 top-5 w-5 h-5 text-gray-400 group-focus-within:text-harvest-green transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full pl-14 pr-14 py-5 rounded-2xl font-bold bg-white/50 dark:bg-black/20 border-2 border-transparent focus:border-harvest-green/50 outline-none transition-all dark:text-white placeholder:text-gray-400"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-5 text-gray-400 hover:text-harvest-green">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full py-5 text-lg shadow-xl shadow-harvest-green/20">
                    {loading ? <Loader2 className="animate-spin" /> : 'SIGN IN'}
                  </Button>
                  <p className="text-center text-sm font-bold text-earth-soil dark:text-gray-400">
                    New here? <button type="button" onClick={() => setView('REGISTER')} className="text-harvest-green dark:text-sprout-green font-black hover:underline underline-offset-4">Create Account</button>
                  </p>
                </motion.form>
              )}

              {view === 'REGISTER' && (
                <motion.form
                  key="register" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                  onSubmit={handleRegisterSubmit} className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative"><UserIcon className="absolute left-4 top-4 w-4 h-4 text-gray-400" /><input type="text" placeholder="Name" value={regData.name} onChange={e => setRegData({ ...regData, name: e.target.value })} className="w-full pl-11 pr-4 py-4 rounded-xl text-sm font-bold bg-white/50 dark:bg-black/20 outline-none border focus:border-harvest-green/50 dark:text-white" /></div>
                    <div className="relative"><Phone className="absolute left-4 top-4 w-4 h-4 text-gray-400" /><input type="tel" placeholder="Phone" value={regData.phone} onChange={e => setRegData({ ...regData, phone: e.target.value })} className="w-full pl-11 pr-4 py-4 rounded-xl text-sm font-bold bg-white/50 dark:bg-black/20 outline-none border focus:border-harvest-green/50 dark:text-white" /></div>
                  </div>
                  <div className="relative"><Mail className="absolute left-5 top-4.5 w-5 h-5 text-gray-400" /><input type="email" placeholder="Email (Optional)" value={regData.email} onChange={e => setRegData({ ...regData, email: e.target.value })} className="w-full pl-14 pr-5 py-4 rounded-xl font-bold bg-white/50 dark:bg-black/20 outline-none border focus:border-harvest-green/50 dark:text-white" /></div>
                  <div className="space-y-2">
                    <div className="relative"><Lock className="absolute left-5 top-4.5 w-5 h-5 text-gray-400" /><input type={showPassword ? "text" : "password"} placeholder="Create Password" value={regData.password} onChange={e => setRegData({ ...regData, password: e.target.value })} className="w-full pl-14 pr-14 py-4 rounded-xl font-bold bg-white/50 dark:bg-black/20 outline-none border focus:border-harvest-green/50 dark:text-white" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-4.5 text-gray-400">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
                    <div className="flex gap-2 h-1.5 px-1">{[1, 2, 3, 4].map(i => (<div key={i} className={`flex-1 rounded-full transition-all ${i <= strength ? (strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-earth-amber' : 'bg-harvest-green') : 'bg-gray-200 dark:bg-gray-700'}`} />))}</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1"><MapPin className="absolute left-5 top-4.5 w-5 h-5 text-gray-400" /><input type="text" placeholder="Location" value={regData.location} onChange={e => setRegData({ ...regData, location: e.target.value })} className="w-full pl-14 pr-5 py-4 rounded-xl font-bold bg-white/50 dark:bg-black/20 outline-none border focus:border-harvest-green/50 dark:text-white" /></div>
                    <button type="button" onClick={handleLocation} className="p-4 bg-harvest-green/10 text-harvest-green rounded-xl hover:bg-harvest-green/20 transition-all">{loading ? <Loader2 className="animate-spin" /> : <MapPin />}</button>
                  </div>
                  <label className="flex items-center gap-4 p-2 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${regData.agreeTerms ? 'bg-harvest-green border-harvest-green' : 'border-gray-300 dark:border-gray-600'}`}>{regData.agreeTerms && <Check className="w-4 h-4 text-white" />}</div>
                    <input type="checkbox" className="hidden" checked={regData.agreeTerms} onChange={e => setRegData({ ...regData, agreeTerms: e.target.checked })} />
                    <span className="text-sm font-bold text-earth-soil dark:text-gray-400">Agree to <span className="text-harvest-green">Terms & Conditions</span></span>
                  </label>
                  <Button type="submit" disabled={loading} className="w-full py-5 text-lg shadow-xl shadow-harvest-green/20">
                    {loading ? <Loader2 className="animate-spin" /> : 'CREATE ACCOUNT'}
                  </Button>
                  <p className="text-center text-sm font-bold text-earth-soil dark:text-gray-400">
                    Already have an account? <button type="button" onClick={() => setView('LOGIN')} className="text-harvest-green dark:text-sprout-green font-black hover:underline underline-offset-4">Sign In</button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Auth;
