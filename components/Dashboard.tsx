import React, { useEffect, useState } from 'react';
import WeatherWidget from './WeatherWidget';
import { ArrowRight, TrendingUp, ShieldCheck, Sprout, Leaf } from 'lucide-react';
import { AppView, WeatherData, MarketPrice } from '../types';
import { getCurrentUser } from '../services/authService';
import { getLocationBasedData } from '../services/geminiService';
import { getRealWeather } from '../services/weatherService';
import { MOCK_MARKET_PRICES, MOCK_WEATHER } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Icons } from './ui/IconSystem';
import { Button } from './ui/Button';

interface DashboardProps {
  setView: (view: AppView) => void;
  onDataLoaded?: (weather: WeatherData, prices: MarketPrice[]) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Dashboard({ setView, onDataLoaded }: DashboardProps) {
  const user = getCurrentUser();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData>(MOCK_WEATHER);
  const [prices, setPrices] = useState<MarketPrice[]>(MOCK_MARKET_PRICES);
  const [activeCrops, setActiveCrops] = useState<{ name: string, status: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.location) {
        setLoading(true);
        try {
          let currentWeatherData: WeatherData | null = null;

          // 1. Real Weather
          try {
            const realWeather = await getRealWeather(user.location);
            if (realWeather) {
              setWeather(realWeather);
              currentWeatherData = realWeather;
            }
          } catch (e) { console.error(e); }

          // 2. Market Data
          try {
            const data = await getLocationBasedData(user.location);
            if (data) {
              if (!currentWeatherData && data.weather) setWeather(data.weather);
              if (data.marketPrices) setPrices(data.marketPrices);
              if (onDataLoaded) onDataLoaded(currentWeatherData || data.weather || weather, data.marketPrices);
            }
          } catch (e) { console.error(e); }

          // 3. Active Crops
          try {
            const token = localStorage.getItem('krishi_net_token');
            if (token) {
              const api = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
              const cropRes = await fetch(`${api}/api/v1/crops/`, { headers: { 'Authorization': `Bearer ${token}` } });
              if (cropRes.ok) {
                const realCrops = await cropRes.json();
                setActiveCrops(realCrops.map((c: any) => ({ name: c.name, status: c.status })));
              }
            }
          } catch (e) { console.error(e); }

        } catch (err) { console.error(err); }
        finally { setLoading(false); }
      }
    };
    fetchData();
  }, [user?.location]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-harvest-green">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-sprout-green/30 border-t-sprout-green rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icons.Logo size={24} className="animate-pulse text-harvest-green" />
          </div>
        </div>
        <p className="text-lg font-bold font-display animate-pulse">Syncing Living Fields...</p>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Welcome Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            {t('welcome')}, <span className="text-green-600 dark:text-green-400">{user?.name.split(' ')[0]}</span>
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 text-earth-soil dark:text-gray-300 font-medium bg-white/40 dark:bg-black/20 px-3 py-1 rounded-full border border-glass-border backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-sprout-green animate-pulse shadow-glow-green"></span>
              <p className="text-sm">{t('liveInsights')} <span className="font-bold text-harvest-green dark:text-sprout-green">{user?.location}</span></p>
            </div>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-3xl font-display font-light text-deep-earth dark:text-mist-white">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
          </p>
          <p className="text-sm font-bold text-harvest-green dark:text-sprout-green uppercase tracking-widest">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-1">
          <motion.div variants={item}>
            <GlassCard className="p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-morning/20 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:bg-sky-morning/30 transition-all"></div>
              <WeatherWidget data={weather} location={user?.location || 'Your Farm'} />
            </GlassCard>
          </motion.div>

          {/* Quick Actions */}
          <GlassCard className="p-6">
            <h3 className="font-heading font-bold text-xl text-deep-earth dark:text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-harvest-green rounded-full"></span>
              {t('quickActions')}
            </h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView(AppView.DISEASE_DETECTION)}
                className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-glass-border hover:border-red-400/50 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100/80 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                    <Icons.Disease size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-deep-earth dark:text-white">{t('scanCrop')}</p>
                    <p className="text-xs text-earth-soil dark:text-gray-400">Detect diseases instantly</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-earth-soil dark:text-gray-400 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView(AppView.ADVISORY)}
                className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-glass-border hover:border-sprout-green/50 hover:bg-sprout-green/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sprout-green/20 rounded-full flex items-center justify-center text-harvest-green dark:text-sprout-green group-hover:scale-110 transition-transform">
                    <Icons.Advisory size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-deep-earth dark:text-white">{t('getAdvice')}</p>
                    <p className="text-xs text-earth-soil dark:text-gray-400">Chat with Agri-AI</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-earth-soil dark:text-gray-400 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Ticker */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-bold text-xl text-deep-earth dark:text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-earth-golden" />
                {t('marketTrends')}
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setView(AppView.MARKET)}>View All</Button>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {prices.slice(0, 3).map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-glass-border relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 p-1.5 rounded-bl-xl text-[10px] font-bold ${item.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {item.trend === 'up' ? '▲' : '▼'} {Math.abs(item.change)}%
                  </div>
                  <p className="text-sm font-medium text-earth-soil dark:text-gray-400 mb-1">{item.crop}</p>
                  <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">₹{item.price}</p>
                  <p className="text-xs text-earth-soil/60 dark:text-gray-500 mt-2">{item.mandi}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Crop Timeline */}
          <GlassCard className="p-6 h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-bold text-xl text-deep-earth dark:text-white flex items-center gap-2">
                <Icons.Farm size={20} className="text-leaf-green" />
                {t('yourCrops')}
              </h3>
              <Button size="sm" variant="primary" onClick={() => setView(AppView.FARM_MANAGEMENT)}>+ Add Crop</Button>
            </div>

            <div className="space-y-0 relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-glass-border"></div>

              {loading ? (
                <div className="p-8 text-center text-earth-soil animate-pulse">Loading timeline...</div>
              ) : activeCrops.length > 0 ? (
                activeCrops.map((crop, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative pl-14 py-3 group"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute left-[21px] top-6 w-3 h-3 rounded-full border-2 border-white dark:border-deep-earth z-10 transition-colors ${crop.status === 'Healthy' ? 'bg-sprout-green' : 'bg-earth-golden'
                      }`}></div>

                    <div className="p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-glass-border group-hover:border-sprout-green/30 transition-all flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-deep-earth dark:text-white text-lg">{crop.name}</h4>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${crop.status === 'Healthy'
                          ? 'bg-sprout-green/20 text-harvest-green dark:text-sprout-green'
                          : 'bg-earth-golden/20 text-earth-amber'
                          }`}>
                          {crop.status === 'Healthy' ? <ShieldCheck size={12} /> : <Leaf size={12} />}
                          {crop.status}
                        </span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" onClick={() => setView(AppView.FARM_MANAGEMENT)}><ArrowRight size={16} /></Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sprout className="text-earth-soil/50" />
                  </div>
                  <p className="text-earth-soil dark:text-gray-400">No crops active yet.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}