
import React, { useState } from 'react';
import { LayoutDashboard, Stethoscope, MessageSquareText, TrendingUp, Tractor, LogOut, MapPin, Moon, Sun, Settings, Mic, X, History } from 'lucide-react';
import { AppView } from '../types';
import { getCurrentUser, logoutUser } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useVoice } from '../contexts/VoiceContext';
import Background from './Background';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const user = getCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { isListening, startListening, stopListening, lastCommand } = useVoice(); // Use Context

  // Voice Command Logic - Effect to handle navigation
  React.useEffect(() => {
    if (!lastCommand) return;

    const command = lastCommand;
    console.log("Processing Command:", command);

    if (command.includes('dashboard') || command.includes('home')) setView(AppView.DASHBOARD);
    else if (command.includes('disease') || command.includes('scan') || command.includes('detect')) setView(AppView.DISEASE_DETECTION);
    else if (command.includes('advisory') || command.includes('chat') || command.includes('ask')) setView(AppView.ADVISORY);
    else if (command.includes('market') || command.includes('price')) setView(AppView.MARKET);
    else if (command.includes('farm') || command.includes('crops')) setView(AppView.FARM_MANAGEMENT);
    else if (command.includes('history') || command.includes('records')) setView(AppView.HISTORY);
    else if (command.includes('settings')) setView(AppView.SETTINGS);
    else if (command.includes('weather')) setView(AppView.DASHBOARD);

    // Note: If command is not navigation, it stays in 'transcript' for AdvisoryChat to pick up
    // We don't resetTranscript() here immediately so AdvisoryChat can read it if needed

  }, [lastCommand, setView]);

  const handleLogout = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    logoutUser();
    window.location.reload();
  };

  const navItems = [
    { id: AppView.DASHBOARD, label: t('dashboard'), icon: LayoutDashboard },
    { id: AppView.DISEASE_DETECTION, label: t('diseaseDetection'), icon: Stethoscope },
    { id: AppView.ADVISORY, label: t('advisory'), icon: MessageSquareText },
    { id: AppView.MARKET, label: t('market'), icon: TrendingUp },
    { id: AppView.FARM_MANAGEMENT, label: t('myFarm'), icon: Tractor },
    { id: AppView.HISTORY, label: "History", icon: History },
    { id: AppView.SETTINGS, label: t('settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      <Background mode={theme === 'dark' ? 'night' : 'day'} />

      {/* Voice Listening Overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl flex flex-col items-center gap-4 text-center border-2 border-agri-green-400">
              <div className="relative">
                <div className="w-20 h-20 bg-agri-green-500 rounded-full animate-ping absolute inset-0 opacity-50"></div>
                <div className="w-20 h-20 bg-agri-green-600 rounded-full flex items-center justify-center relative z-10 text-white">
                  <Mic className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white">Listening...</h3>
              <p className="text-black font-medium">Try saying "Go to Market" or "Scan Crop"</p>
              <button onClick={stopListening} className="mt-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <X className="w-6 h-6 text-black dark:text-gray-300" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Green/Blue Gradient */}
      <aside className="hidden md:flex w-72 h-screen fixed z-20 flex-col border-r border-farm-blue-200 bg-gradient-to-b from-agri-green-100 to-farm-blue-100 backdrop-blur-xl shadow-xl transition-colors duration-300">
        <div className="p-8 border-b border-agri-green-200">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-black flex items-center gap-3"
          >
            <span className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white text-xl shadow-lg">K</span>
            {t('appTitle')}
          </motion.h1>
        </div>

        {/* User Mini Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-4 mt-6 p-4 rounded-2xl bg-white/50 border-2 border-agri-green-300 backdrop-blur-sm"
        >
          <p className="font-bold text-black">{user?.name || 'Farmer'}</p>
          <div className="flex items-center gap-1 text-xs text-black font-semibold mt-1">
            <MapPin className="w-3 h-3 text-farm-blue-600" />
            <span className="truncate">{user?.location || 'India'}</span>
          </div>
        </motion.div>

        <nav className="flex-1 px-4 mt-8 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={item.id}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setView(item.id);
              }}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold transition-all duration-200 border-2 ${currentView === item.id
                ? 'bg-black text-white border-black shadow-lg'
                : 'bg-white/40 border-transparent text-black hover:bg-white hover:border-agri-green-300'
                }`}
            >
              <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-agri-green-400' : 'text-black'}`} />
              {item.label}
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-agri-green-200 flex items-center justify-between gap-2">
          {/* Voice Button Desktop */}
          <button
            onClick={startListening}
            className="p-3 rounded-xl bg-farm-blue-200 text-black border-2 border-farm-blue-300 hover:bg-farm-blue-300 transition-colors"
            title="Voice Command"
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-agri-green-200 text-black border-2 border-agri-green-300 hover:bg-agri-green-300 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-black border-2 border-gray-200 hover:bg-gray-100 rounded-xl font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-agri-green-100 to-farm-blue-100 border-b border-agri-green-300 p-4 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-lg font-bold">K</span>
          <span className="font-black text-lg text-black">{t('appTitle')}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={startListening} className="p-2 text-black bg-white/50 rounded-full">
            <Mic className="w-5 h-5" />
          </button>
          <button onClick={() => setView(AppView.SETTINGS)} className="p-2 text-black bg-white/50 rounded-full">
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={toggleTheme} className="p-2 text-black bg-white/50 rounded-full">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={handleLogout} className="p-2 text-black bg-white/50 rounded-full">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-black text-white shadow-2xl rounded-2xl flex justify-around p-2 z-30 border-2 border-agri-green-400">
        {navItems.slice(0, 5).map((item) => (
          <motion.button
            whileTap={{ scale: 0.8 }}
            key={item.id}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(5);
              setView(item.id);
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentView === item.id ? 'text-agri-green-400' : 'text-gray-400'
              }`}
          >
            <item.icon className="w-6 h-6" />
          </motion.button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
