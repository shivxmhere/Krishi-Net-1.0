import React from 'react';
import { AppView } from '../types';
import { getCurrentUser, logoutUser } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useVoice } from '../contexts/VoiceContext';
// Background removed for simple UI
import { Icons } from './ui/IconSystem';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Sun, Moon, LogOut } from 'lucide-react'; // Keep utility icons from Lucide for now

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const user = getCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { isListening, startListening, stopListening, lastCommand } = useVoice();

  // Voice Command Logic
  React.useEffect(() => {
    if (!lastCommand) return;
    const command = lastCommand.toLowerCase();

    const viewMap: Record<string, AppView> = {
      dashboard: AppView.DASHBOARD,
      home: AppView.DASHBOARD,
      disease: AppView.DISEASE_DETECTION,
      scan: AppView.DISEASE_DETECTION,
      detect: AppView.DISEASE_DETECTION,
      advisory: AppView.ADVISORY,
      chat: AppView.ADVISORY,
      ask: AppView.ADVISORY,
      market: AppView.MARKET,
      price: AppView.MARKET,
      farm: AppView.FARM_MANAGEMENT,
      crop: AppView.FARM_MANAGEMENT,
      history: AppView.HISTORY,
      record: AppView.HISTORY,
      setting: AppView.SETTINGS
    };

    for (const key in viewMap) {
      if (command.includes(key)) {
        setView(viewMap[key]);
        return;
      }
    }
  }, [lastCommand, setView]);

  const handleLogout = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    logoutUser();
    window.location.reload();
  };

  const navItems = [
    { id: AppView.DASHBOARD, label: t('dashboard'), Icon: Icons.Dashboard },
    { id: AppView.DISEASE_DETECTION, label: t('diseaseDetection'), Icon: Icons.Disease },
    { id: AppView.ADVISORY, label: t('advisory'), Icon: Icons.Advisory },
    { id: AppView.MARKET, label: t('market'), Icon: Icons.Market },
    { id: AppView.FARM_MANAGEMENT, label: t('myFarm'), Icon: Icons.Farm },
    { id: AppView.HISTORY, label: "History", Icon: Icons.History },
    { id: AppView.SETTINGS, label: t('settings'), Icon: Icons.Profile },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900">

      {/* Voice Overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl flex flex-col items-center gap-6 text-center shadow-2xl max-w-sm w-full">
              <div className="relative">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full animate-pulse absolute inset-0 opacity-40"></div>
                <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center relative z-10 text-white shadow-xl">
                  <Mic className="w-10 h-10" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">Listening...</h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Try saying "Market Prices"</p>
              </div>
              <button
                onClick={stopListening}
                className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Solid */}
      <aside className="hidden md:flex w-72 h-screen fixed z-30 flex-col bg-white border-r border-gray-100">
        {/* Logo Section */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Icons.Logo size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">AgriScan AI</h1>
          </motion.div>
        </div>

        {/* User Profile Card */}
        <div className="px-4 py-2">
          <div className="p-4 rounded-xl border border-gray-100 flex items-center gap-3">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop"
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/20"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900 truncate">{user?.name || 'Rajesh Kumar'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.location || 'Pune, MH'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Online</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400">v2.4</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setView(item.id)}
                whileHover={{ x: 4, backgroundColor: 'rgba(236, 253, 245, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${isActive
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-gray-500 hover:text-emerald-600'
                  }`}
              >
                <item.Icon
                  size={20}
                  className={`${isActive ? 'text-emerald-500' : 'text-gray-400 group-hover:text-emerald-500'}`}
                />
                <span className="text-sm">{item.label}</span>
              </motion.button>
            )
          })}
        </nav>

        {/* Bottom Actions - Match Screenshot */}
        <div className="p-4 space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startListening}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20"
          >
            <Mic size={20} />
            Voice Query
          </motion.button>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
              <span>Language</span>
              <Icons.Language size={14} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2 rounded-lg border border-gray-100 text-xs font-bold text-gray-500 hover:border-emerald-200 hover:text-emerald-600 transition-all">English</button>
              <button className="py-2 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold transition-all">हिन्दी</button>
              <button className="py-2 rounded-lg border border-gray-100 text-xs font-bold text-gray-500 hover:border-emerald-200 hover:text-emerald-600 transition-all">मराठी</button>
              <button className="py-2 rounded-lg border border-gray-100 text-xs font-bold text-gray-500 hover:border-emerald-200 hover:text-emerald-600 transition-all">தமிழ்</button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between px-1">
            <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-gray-600">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header - Solid */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Icons.Logo size={20} />
          </div>
          <span className="font-display font-bold text-xl text-gray-900 dark:text-white tracking-tight">Krishi-Net</span>
        </div>
        <div className="flex gap-2">
          <button onClick={startListening} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
            <Mic size={20} />
          </button>
          <button onClick={toggleTheme} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setView(AppView.SETTINGS)} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
            <Icons.Profile size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 relative z-10 h-screen overflow-y-auto pt-20 md:pt-0 scroll-smooth bg-gray-50">
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-28 md:pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 flex justify-between px-6 py-3">
        {navItems.slice(0, 5).map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                setView(item.id);
              }}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <item.Icon size={24} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  );
};

export default Layout;
