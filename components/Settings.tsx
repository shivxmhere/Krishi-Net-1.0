import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getCurrentUser, updateUserProfile } from '../services/authService';
import { User, Language } from '../types';
import { User as UserIcon, Globe, MapPin, CheckCircle, Mail, Loader2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { Icons } from './ui/IconSystem';

interface SettingsProps {
  onUpdateUser: (user: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ onUpdateUser }) => {
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [email, setEmail] = useState(user?.email || '');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    if (user) {
      setLoading(true);
      try {
        const updatedUser = { ...user, name, location, email };
        await updateUserProfile(updatedUser);
        setUser(updatedUser);
        onUpdateUser(updatedUser);
        setShowSuccess(true);
        if (navigator.vibrate) navigator.vibrate([10, 30]);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (e) {
        console.error("Failed to update settings");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <GlassCard className="p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <Icons.Settings size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings')}</h2>
          <p className="text-earth-soil dark:text-gray-400 font-medium">Manage your preferences and profile.</p>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Language Card */}
        <GlassCard className="col-span-1 p-6 h-fit">
          <h3 className="text-lg font-bold text-deep-earth dark:text-white flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-harvest-green" />
            {t('selectLanguage')}
          </h3>
          <div className="space-y-3">
            {(['en', 'hi', 'ur'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between group ${language === lang
                  ? 'border-harvest-green bg-harvest-green/10 text-harvest-green font-bold'
                  : 'border-transparent bg-white/50 dark:bg-black/20 text-earth-soil dark:text-gray-300 hover:bg-white/80 dark:hover:bg-black/30'
                  }`}
              >
                <span>{lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'اردو'}</span>
                {language === lang && <CheckCircle size={16} />}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Profile Form */}
        <GlassCard className="col-span-2 p-8 space-y-6">
          <h3 className="text-lg font-bold text-deep-earth dark:text-white flex items-center gap-2 mb-2">
            <UserIcon className="w-5 h-5 text-harvest-green" />
            {t('profileSettings')}
          </h3>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-earth-soil dark:text-gray-400 ml-1">{t('fullName')}</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-white/50 dark:bg-black/20 border border-glass-border rounded-xl font-bold outline-none focus:ring-2 focus:ring-harvest-green dark:text-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-earth-soil dark:text-gray-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-black/20 border border-glass-border rounded-xl font-bold outline-none focus:ring-2 focus:ring-harvest-green dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-earth-soil dark:text-gray-400 ml-1">{t('location')}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <input
                  type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-black/20 border border-glass-border rounded-xl font-bold outline-none focus:ring-2 focus:ring-harvest-green dark:text-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={loading} className="w-full py-4 text-lg shadow-sm bg-green-600 hover:bg-green-700 text-white border-0 rounded-xl">
              {loading ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> {t('saveChanges')}</>}
            </Button>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl flex items-center justify-center gap-2 font-bold"
              >
                <CheckCircle className="w-5 h-5" /> {t('settingsSaved')}
              </motion.div>
            )}
          </AnimatePresence>

        </GlassCard>
      </div>
    </div>
  );
};

export default Settings;
