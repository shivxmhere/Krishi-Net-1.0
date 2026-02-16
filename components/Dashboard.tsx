import React, { useEffect, useState } from 'react';
import WeatherWidget from './WeatherWidget';
import { ArrowRight, Leaf, Sprout, TrendingUp, Loader2, ThermometerSun, Droplets } from 'lucide-react';
import { AppView, WeatherData, MarketPrice } from '../types';
import { getCurrentUser } from '../services/authService';
import { getLocationBasedData } from '../services/geminiService';
import { getRealWeather } from '../services/weatherService';
import { MOCK_MARKET_PRICES, MOCK_WEATHER } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

interface DashboardProps {
  setView: (view: AppView) => void;
  onDataLoaded?: (weather: WeatherData, prices: MarketPrice[]) => void; 
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
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
  const [activeCrops, setActiveCrops] = useState<{name: string, status: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.location) {
        setLoading(true);
        let currentWeatherData: WeatherData | null = null;
        
        // 1. Fetch Real Weather independently (Accurate)
        try {
          const realWeather = await getRealWeather(user.location);
          if (realWeather) {
            setWeather(realWeather);
            currentWeatherData = realWeather;
          }
        } catch (e) {
          console.error("Failed to fetch real weather, using satellite fallback");
        }

        // 2. Fetch Market/Crop Data from Gemini (Simulation)
        const data = await getLocationBasedData(user.location);
        
        if (data) {
          // Only overwrite weather if real weather failed
          if (!currentWeatherData && data.weather) {
            setWeather(data.weather);
          }
          if (data.marketPrices) setPrices(data.marketPrices);
          if (data.activeCrops) setActiveCrops(data.activeCrops);
          
          if (onDataLoaded) {
            onDataLoaded(currentWeatherData || data.weather || weather, data.marketPrices);
          }
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user?.location]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-black">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-agri-green-200 border-t-black rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <Sprout className="w-6 h-6 animate-pulse text-agri-green-600" />
          </div>
        </div>
        <p className="text-lg font-bold text-black">Syncing Satellite Data...</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={item} className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-black tracking-tight">
            {t('welcome')}, {user?.name.split(' ')[0]}
          </h2>
          <div className="flex items-center gap-2 mt-2 text-black font-semibold">
            <span className="w-3 h-3 rounded-full bg-agri-green-500 animate-pulse border border-black"></span>
            <p>{t('liveInsights')} <span className="font-bold text-farm-blue-700">{user?.location}</span></p>
          </div>
        </div>
        <div className="hidden md:block text-right">
           <p className="text-3xl font-light text-black">
             {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
           </p>
           <p className="text-sm font-bold text-black uppercase tracking-widest bg-agri-green-200 px-2 py-1 rounded-md inline-block">
             {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
           </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Weather & Quick Actions */}
        <div className="space-y-8 lg:col-span-1">
          <motion.div variants={item}>
             <WeatherWidget data={weather} location={user?.location || 'Your Farm'} />
          </motion.div>
          
          <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border-2 border-agri-green-400">
            <h3 className="font-black text-black text-xl mb-4 ml-1">{t('quickActions')}</h3>
            <div className="space-y-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView(AppView.DISEASE_DETECTION)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-black hover:bg-red-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 border border-red-200">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-black">{t('scanCrop')}</p>
                    <p className="text-xs font-semibold text-gray-500">{t('scanDesc')}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView(AppView.ADVISORY)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-black hover:bg-agri-green-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-agri-green-100 rounded-full flex items-center justify-center text-agri-green-600 border border-agri-green-200">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-black">{t('getAdvice')}</p>
                    <p className="text-xs font-semibold text-gray-500">{t('adviceDesc')}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Market & Crops */}
        <div className="lg:col-span-2 space-y-8">
          {/* Market Highlights */}
          <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl border-2 border-farm-blue-400">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-2xl text-black">{t('marketTrends')}</h3>
              <button onClick={() => setView(AppView.MARKET)} className="px-4 py-1 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800">{t('viewAll')}</button>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {prices.slice(0, 3).map((item, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5 }}
                  className="p-5 rounded-2xl bg-white border-2 border-farm-blue-100 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-sm font-bold text-black">{item.crop}</p>
                     <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${item.trend === 'up' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                       {item.trend === 'up' ? '↑' : '↓'} {Math.abs(item.change)}%
                     </span>
                  </div>
                  <p className="text-2xl font-black text-black">₹{item.price}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Active Crops Summary (Dynamic) */}
          <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl border-2 border-agri-green-400 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-2xl text-black">{t('yourCrops')}</h3>
              <button onClick={() => setView(AppView.FARM_MANAGEMENT)} className="px-4 py-1 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800">{t('manage')}</button>
            </div>
            <div className="space-y-4">
              {activeCrops.length > 0 ? activeCrops.map((crop, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 backdrop-blur-sm ${
                    idx % 2 === 0 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-agri-green-50 border-agri-green-200'
                  }`}
                >
                  <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border-2 ${idx % 2 === 0 ? 'border-yellow-100 text-yellow-600' : 'border-agri-green-100 text-agri-green-600'}`}>
                    {idx % 2 === 0 ? <Sprout className="w-6 h-6" /> : <Leaf className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-black text-lg">{crop.name}</h4>
                    <p className="text-sm font-semibold text-black">{crop.status}</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-black"></div>
                </motion.div>
              )) : (
                <div className="p-4 text-center text-black font-medium">Loading crops...</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}