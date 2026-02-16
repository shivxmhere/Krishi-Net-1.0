
import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser, sendOTP, verifyOTP, checkUserExists } from '../services/authService';
import { MapPin, Phone, User as UserIcon, Mail, Loader2, ArrowLeft, Lock, Eye, EyeOff, Check, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './Background';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'OTP';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login State
  const [loginMethod, setLoginMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
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
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpInput, setOtpInput] = useState('');
  const [countdown, setCountdown] = useState(300);

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
      navigator.geolocation.getCurrentPosition(
        async (position) => {
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
        () => setLoading(false)
      );
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const exists = await checkUserExists(identifier);
      if (!exists) throw new Error("Account not found. Please Sign Up.");

      if (loginMethod === 'PASSWORD') {
        const user = await loginUser(identifier, password);
        onLogin(user);
      } else {
        await sendOTP(identifier);
        setView('OTP');
      }
    } catch (err: any) {
      setError(err.message);
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
      const exists = await checkUserExists(regData.phone);
      if (exists) throw new Error("Phone already registered. Please Login.");
      
      await sendOTP(regData.phone);
      setView('OTP');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const target = view === 'OTP' && regData.phone ? regData.phone : identifier;
      const isValid = await verifyOTP(target, otpInput);
      if (!isValid) throw new Error("Invalid or Expired OTP");

      if (regData.phone) {
        // Finishing Registration
        const user = await registerUser(regData);
        onLogin(user);
      } else {
        // Finishing Login
        const user = await loginUser(identifier);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden bg-gray-50">
      <Background mode="day" />
      
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/50 relative z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 pb-0 text-center">
           <h1 className="text-2xl font-black text-gray-900 tracking-tight">Krishi-Net</h1>
           <p className="text-green-600 font-bold text-xs uppercase tracking-widest mt-1">Smart Agriculture</p>
        </div>

        <div className="p-8">
          {error && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {view === 'LOGIN' && (
              <motion.form 
                key="login"
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
                onSubmit={handleLoginSubmit} 
                className="space-y-5"
              >
                {/* Login Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                  <button type="button" onClick={() => setLoginMethod('PASSWORD')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginMethod === 'PASSWORD' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>Password</button>
                  <button type="button" onClick={() => setLoginMethod('OTP')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginMethod === 'OTP' ? 'bg-white shadow text-black' : 'text-gray-400'}`}>OTP</button>
                </div>

                <div className="relative">
                  <UserIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Phone or Email" value={identifier} onChange={e => setIdentifier(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:bg-white focus:border-green-500 outline-none transition-all" />
                </div>

                {loginMethod === 'PASSWORD' && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:bg-white focus:border-green-500 outline-none transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-400 hover:text-black">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full py-4 bg-green-600 text-white rounded-xl font-black shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all flex justify-center">
                   {loading ? <Loader2 className="animate-spin" /> : (loginMethod === 'PASSWORD' ? 'Sign In' : 'Send OTP')}
                </button>
                
                <p className="text-center text-gray-500 text-sm font-medium">
                  New here? <button type="button" onClick={() => setView('REGISTER')} className="text-green-600 font-bold hover:underline">Create Account</button>
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
                <div className="grid grid-cols-2 gap-3">
                   <div className="relative">
                     <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                     <input type="text" placeholder="Name" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="w-full pl-9 pr-3 py-3 bg-gray-50 rounded-xl text-sm font-bold outline-none border border-transparent focus:border-green-500" />
                   </div>
                   <div className="relative">
                     <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                     <input type="tel" placeholder="Phone" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} className="w-full pl-9 pr-3 py-3 bg-gray-50 rounded-xl text-sm font-bold outline-none border border-transparent focus:border-green-500" />
                   </div>
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input type="email" placeholder="Email (Optional)" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:bg-white focus:border-green-500 outline-none transition-all" />
                </div>

                <div>
                   <div className="relative">
                      <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <input type={showPassword ? "text" : "password"} placeholder="Create Password" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:bg-white focus:border-green-500 outline-none transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-400 hover:text-black">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                   </div>
                   {/* Password Strength */}
                   <div className="flex gap-1 mt-2 h-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`flex-1 rounded-full transition-colors ${i <= strength ? (strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`} />
                      ))}
                   </div>
                   <p className="text-xs text-gray-400 mt-1 text-right">{strength < 2 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong'}</p>
                </div>

                <div className="flex gap-2">
                   <div className="relative flex-1">
                     <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                     <input type="text" placeholder="Location" value={regData.location} onChange={e => setRegData({...regData, location: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:bg-white focus:border-green-500 outline-none transition-all" />
                   </div>
                   <button type="button" onClick={handleLocation} className="p-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                     {loading ? <Loader2 className="animate-spin" /> : <MapPin />}
                   </button>
                </div>

                <label className="flex items-center gap-3 p-2 cursor-pointer">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${regData.agreeTerms ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                    {regData.agreeTerms && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={regData.agreeTerms} onChange={e => setRegData({...regData, agreeTerms: e.target.checked})} />
                  <span className="text-sm font-medium text-gray-500">I agree to <span className="text-green-600">Terms & Conditions</span></span>
                </label>

                <button type="submit" disabled={loading} className="w-full py-4 bg-green-600 text-white rounded-xl font-black shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all flex justify-center">
                   {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                </button>

                <p className="text-center text-gray-500 text-sm font-medium">
                  Already have an account? <button type="button" onClick={() => setView('LOGIN')} className="text-green-600 font-bold hover:underline">Sign In</button>
                </p>
              </motion.form>
            )}

            {view === 'OTP' && (
              <motion.form 
                key="otp"
                initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                onSubmit={handleVerifyOTP} 
                className="space-y-6 text-center"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Verify it's you</h3>
                  <p className="text-gray-500 text-sm mt-1">We sent a code to <span className="font-bold text-black">{regData.phone || identifier}</span></p>
                </div>

                <input type="text" autoFocus maxLength={6} placeholder="123456" value={otpInput} onChange={e => setOtpInput(e.target.value)} className="w-full text-center text-4xl font-mono font-bold tracking-[0.5em] py-4 bg-transparent border-b-4 border-gray-200 focus:border-green-600 outline-none transition-colors" />

                <p className="text-sm text-gray-400">Code expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</p>

                <div className="flex gap-3">
                   <button type="button" onClick={() => setView(regData.phone ? 'REGISTER' : 'LOGIN')} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">Back</button>
                   <button type="submit" disabled={loading} className="flex-[2] py-4 bg-green-600 text-white rounded-xl font-black shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all flex justify-center">
                     {loading ? <Loader2 className="animate-spin" /> : 'Verify'}
                   </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
