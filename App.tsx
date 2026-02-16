
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DiseaseDetector from './components/DiseaseDetector';
import AdvisoryChat from './components/AdvisoryChat';
import MarketPrices from './components/MarketPrices';
import FarmManager from './components/FarmManager';
import History from './components/History';
import Settings from './components/Settings';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import { AppView, User } from './types';
import { getCurrentUser } from './services/authService';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setView] = useState<AppView>(AppView.DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // 1. Check Onboarding Status
    const onboardingCompleted = localStorage.getItem('krishi_onboarding_completed');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }

    // 2. Check User Session
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('krishi_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard setView={setView} />;
      case AppView.DISEASE_DETECTION:
        return <DiseaseDetector />;
      case AppView.ADVISORY:
        return <AdvisoryChat />;
      case AppView.MARKET:
        return <MarketPrices />;
      case AppView.FARM_MANAGEMENT:
        return <FarmManager />;
      case AppView.HISTORY:
        return <History />;
      case AppView.SETTINGS:
        return <Settings onUpdateUser={handleUserUpdate} />;
      default:
        return <Dashboard setView={setView} />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-primary-50 dark:bg-gray-900 text-primary-600">
        <div className="animate-pulse font-bold text-xl">Loading Krishi-Net...</div>
      </div>
    );
  }

  // Show Onboarding if not completed (regardless of auth)
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Show Auth if not logged in
  if (!user) {
    return (
      <LanguageProvider>
        <Auth onLogin={handleLogin} />
      </LanguageProvider>
    );
  }

  return (
    <Layout currentView={currentView} setView={setView}>
      {renderView()}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
