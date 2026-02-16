import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser, sendOTP, verifyOTP, loginWithGoogle, checkUserExists } from '../services/authService';
import { MapPin, Phone, User as UserIcon, Mail, Loader2, Sprout, ArrowRight, ArrowLeft, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './Background';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [step, setStep] = useState<'INPUT' | 'OTP'>('INPUT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [showOtpToast, setShowOtpToast] = useState(false);

  // Form Data
  const [identifier, setIdentifier] = useState(''); // Phone or Email for login
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    state: ''
  });
  const [otpInput, setOtpInput] = useState('');

  const handleLocation = () => {
    if(navigator.vibrate) navigator.vibrate(10);
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Uses BigDataCloud Free API for reliable client-side reverse geocoding
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            
            const city = data.city || data.locality || data.principalSubdivision || '';
            const stateName = data.principalSubdivision || '';
            const country = data.countryName || '';
            
            const formatted = [city, stateName, country].filter(Boolean).join(', ');
            setFormData(prev => ({ ...prev, location: formatted, state: stateName }));
          } catch (err) {
            setFormData(prev => ({ ...prev, location: `${position.coords.latitude}, ${position.coords.longitude}` }));
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError("Location access denied.");
          setLoading(false);
        }
      );
    }
  };

  const initiateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        if (!identifier) throw new Error("Please enter Phone or Email");
        
        // Check if user exists
        const exists = await checkUserExists(identifier);
        if (!exists) throw new Error("Account not found. Please Sign Up.");

        const code = await sendOTP(identifier);
        setGeneratedOtp(code);
        setShowOtpToast(true);
        setStep('OTP');
      } else {
        // Register Mode
        if (!formData.name || !formData.phone || !formData.location) {
          throw new Error("Please fill required fields (Name, Phone, Location)");
        }
        
        // Check if phone already registered
        const exists = await checkUserExists(formData.phone);
        if (exists) throw new Error("Phone number already registered. Please Login.");

        const code = await sendOTP(formData.phone);
        setGeneratedOtp(code);
        setShowOtpToast(true);
        setStep('OTP');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!generatedOtp) throw new Error("Session expired. Retry.");
      
      const isValid = await verifyOTP(otpInput, generatedOtp);
      if (!isValid) throw new Error("Invalid OTP");

      if (mode === 'LOGIN') {
        const user = await loginUser(identifier);
        onLogin(user);
      } else {
        const newUser: User = {
          id: 'user_' + Date.now(),
          ...formData,
          joinedDate: new Date().toISOString()
        };
        const created = await registerUser(newUser);
        onLogin(created);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden bg-gradient-to-br from-agri-green-50 to-farm-blue-50">
      <Background mode="day" />

      {/* Mock SMS Notification */}
      <AnimatePresence>
        {showOtpToast && generatedOtp && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
          >
            <div className="bg-white shadow-2xl rounded-2xl p-4 border-2 border-black flex items-center gap-4 max-w-sm mx-4 pointer-events-auto">
              <div className="bg-green-100 p-2 rounded-full border border-green-200">
                <MessageCircle className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="font-black text-black">Messages • Now</p>
                <p className="text-black text-sm">Your Krishi-Net verification code is: <span className="font-mono font-black text-lg text-agri-green-600">{generatedOtp}</span></p>
              </div>
              <button onClick={() => setShowOtpToast(false)} className="text-gray-400 hover:text-black text-xs self-start font-bold">Dismiss</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-2xl border-4 border-agri-green-400 overflow-hidden relative z-10"
      >
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-black shadow-xl shadow-agri-green-500/30 mb-4 border-4 border-agri-green-400">
              <Sprout className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-black">Krishi-Net</h1>
            <p className="text-black font-semibold text-sm bg-agri-green-100 inline-block px-3 py-1 rounded-full mt-2">Smart Agriculture Platform</p>
          </div>

          {/* Tabs */}
          {step === 'INPUT' && (
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6 border border-gray-200">
              <button 
                onClick={() => { setMode('LOGIN'); setError(''); }}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'LOGIN' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:text-black'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMode('REGISTER'); setError(''); }}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'REGISTER' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:text-black'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 font-bold text-sm rounded-xl text-center border-2 border-red-200">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'INPUT' ? (
              <motion.form
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={initiateAuth}
                className="space-y-4"
              >
                {mode === 'LOGIN' ? (
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Phone or Email"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-black font-semibold text-black outline-none transition-colors"
                    />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Full Name"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-black font-semibold text-black outline-none transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="Mobile Number"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-black font-semibold text-black outline-none transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Email (Optional)"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-black font-semibold text-black outline-none transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          placeholder="City/Village"
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-black font-semibold text-black outline-none transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleLocation}
                        className="p-4 bg-agri-green-100 text-agri-green-700 rounded-xl hover:bg-agri-green-200 transition-colors border-2 border-agri-green-200"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                      </button>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-agri-green-600 text-white font-black rounded-xl shadow-xl hover:bg-agri-green-700 transition-all flex items-center justify-center gap-2 border-b-4 border-agri-green-800 active:border-b-0 active:translate-y-1"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      {mode === 'LOGIN' ? 'Send OTP' : 'Verify Phone'} 
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={verifyAndProceed}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-black text-black">Verify Phone</h3>
                  <p className="text-gray-500 text-sm mt-1 font-semibold">
                    Enter the code sent to {mode === 'LOGIN' ? identifier : formData.phone}
                  </p>
                </div>

                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full py-4 text-center text-3xl font-mono font-bold tracking-widest bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-black outline-none text-black"
                  autoFocus
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('INPUT')}
                    className="flex-1 py-3.5 bg-gray-100 text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 border-2 border-transparent hover:border-gray-300"
                  >
                    <ArrowLeft className="w-5 h-5" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-3.5 bg-agri-green-600 text-white font-black rounded-xl shadow-lg hover:bg-agri-green-700 transition-all flex items-center justify-center gap-2 border-b-4 border-agri-green-800 active:border-b-0 active:translate-y-1"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
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