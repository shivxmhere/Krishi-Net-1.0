
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
import Welcome from './components/Welcome'; // Import Welcome
import { AppView, User } from './types';
import { getCurrentUser, completeOnboarding } from './services/authService';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { VoiceProvider } from './contexts/VoiceContext';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setView] = useState<AppView>(AppView.DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [showAppTour, setShowAppTour] = useState(false);

  useEffect(() => {
    // 1. Check App Tour Status (different from User Onboarding)
    const tourCompleted = localStorage.getItem('krishi_tour_completed');
    if (!tourCompleted) {
      setShowAppTour(true);
    }

    // 2. Check User Session
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const handleTourComplete = () => {
    localStorage.setItem('krishi_tour_completed', 'true');
    setShowAppTour(false);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleWelcomeComplete = async () => {
    if (user) {
      const updated = await completeOnboarding(user);
      setUser(updated);
      setView(AppView.FARM_MANAGEMENT); // Redirect to add crop
    }
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

  // 1. Show App Tour (Slides) if not seen yet
  if (showAppTour) {
    return <Onboarding onComplete={handleTourComplete} />;
  }

  // 2. Show Auth if not logged in
  if (!user) {
    return (
      <LanguageProvider>
        <Auth onLogin={handleLogin} />
      </LanguageProvider>
    );
  }

  // 3. Show Welcome Screen if User is not onboarded (Fresh Signup)
  if (!user.isOnboarded) {
    return <Welcome user={user} onGetStarted={handleWelcomeComplete} />;
  }

  // 4. Main App
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
        <VoiceProvider>
          <AppContent />
        </VoiceProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
