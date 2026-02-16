import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getCurrentUser, updateUserProfile } from '../services/authService';
import { User, Language } from '../types';
import { Save, User as UserIcon, Globe, MapPin, CheckCircle, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
        
        // Update local state
        setUser(updatedUser);
        // Update App Global State instantly (Fixes blank screen bug)
        onUpdateUser(updatedUser);
        
        setShowSuccess(true);
        if(navigator.vibrate) navigator.vibrate([10, 30]);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (e) {
        console.error("Failed to update settings");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        {t('settings')}
      </h2>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 space-y-8"
      >
        {/* Language Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Globe className="w-5 h-5 text-agri-green-500" />
            {t('selectLanguage')}
          </h3>
          <div className="grid grid-cols-3 gap-4">
             {(['en', 'hi', 'ur'] as Language[]).map((lang) => (
               <button
                 key={lang}
                 onClick={() => setLanguage(lang)}
                 className={`p-4 rounded-xl border-2 transition-all text-center ${
                   language === lang 
                     ? 'border-agri-green-500 bg-agri-green-50 dark:bg-agri-green-900/20 text-agri-green-700 dark:text-agri-green-400 font-bold' 
                     : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:text-gray-300'
                 }`}
               >
                 {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'اردو'}
               </button>
             ))}
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

        {/* Profile Section */}
        <div className="space-y-6">
           <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-agri-green-500" />
            {t('profileSettings')}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('fullName')}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-agri-green-500 outline-none dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Email Address</label>
            <div className="relative">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-agri-green-500 outline-none dark:text-white"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('location')}</label>
            <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-agri-green-500 outline-none dark:text-white"
                />
            </div>
          </div>
        </div>

        <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 bg-agri-green-600 text-white rounded-xl font-bold hover:bg-agri-green-700 transition-colors flex items-center justify-center gap-2"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Save className="w-5 h-5" />
                {t('saveChanges')}
              </>
            )}
        </button>

        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {t('settingsSaved')}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Settings;
