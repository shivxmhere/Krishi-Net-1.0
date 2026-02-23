
import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, TrendingUp, Navigation, Loader2, Crosshair, ChevronRight, Bell, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Icons } from './ui/IconSystem';
import { Button } from './ui/Button';

// Sparkline Mock Data
const sparkData = [
  { p: 10 }, { p: 20 }, { p: 15 }, { p: 25 }, { p: 22 }, { p: 30 }, { p: 28 }, { p: 40 }
];

const MarketPrices: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'trends' | 'mandis' | 'buyers' | 'profit'>('trends');
  const [location, setLocation] = useState({ state: 'Madhya Pradesh', district: 'Indore' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const marketPredictions = [
    {
      name: 'Wheat (Sharbati)',
      price: '₹2,850',
      change: '+4.2% (7 Days)',
      range: '₹2,800 - ₹2,920',
      rec: 'SELL',
      trend: 'up',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=200&h=200&auto=format&fit=crop'
    },
    {
      name: 'Cotton (Desi)',
      price: '₹6,100',
      change: '-0.5% (7 Days)',
      range: '₹6,000 - ₹6,150',
      rec: 'HOLD',
      trend: 'down',
      image: 'https://images.unsplash.com/photo-1594904351111-a072f80b1a71?q=80&w=200&h=200&auto=format&fit=crop'
    },
    {
      name: 'Soybean (Yellow)',
      price: '₹4,800',
      change: '-1.8% (7 Days)',
      range: '₹4,750 - ₹4,850',
      rec: 'HOLD',
      trend: 'down',
      image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=200&h=200&auto=format&fit=crop'
    },
    {
      name: 'Red Onion',
      price: '₹1,950',
      change: '+6.5% (7 Days)',
      range: '₹1,800 - ₹2,000',
      rec: 'SELL',
      trend: 'up',
      image: 'https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=200&h=200&auto=format&fit=crop'
    }
  ];

  const nearbyMandis = [
    { name: 'Indore Mandi', dist: '12 km away' },
    { name: 'Dewas Mandi', dist: '35 km away' },
    { name: 'Ujjain Mandi', dist: '52 km away' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="flex items-center gap-6 mb-8">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search Mandi, Crop or say 'Gehu ka bhav'..."
            className="w-full pl-12 pr-12 py-4 bg-white rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-sm"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-lg cursor-pointer">
            <Icons.Advisory size={16} /> {/* Placeholder for mic/voice */}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white rounded-full border border-gray-100 text-gray-400 relative">
            <Icons.Bell size={20} />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-100">
            <Icons.Language size={16} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-700">English / हिन्दी</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Region & Mandis */}
        <div className="lg:col-span-4 space-y-8">
          <GlassCard className="p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Select Region</h3>
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 tracking-widest px-2 py-0.5 bg-emerald-50 rounded-md ring-1 ring-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Updates
              </span>
            </div>

            {/* Map Placeholder - MP Indore */}
            <div className="aspect-square bg-emerald-50/50 rounded-3xl border border-emerald-100 relative flex items-center justify-center p-8">
              <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-600/20 fill-emerald-100 stroke-emerald-200 stroke-2">
                <path d="M50,150 L30,120 L40,80 L80,40 L120,30 L160,50 L170,100 L140,160 L90,170 Z" />
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  cx="90" cy="110" r="6" className="fill-red-500 stroke-white stroke-2"
                />
                <text x="95" y="115" className="text-[10px] fill-gray-500 font-black">Indore</text>
              </svg>
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                <div className="flex-1 p-3 bg-white rounded-xl shadow-lg border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">State</p>
                  <p className="text-xs font-black text-gray-900 leading-none">Madhya Pradesh</p>
                </div>
                <div className="flex-1 p-3 bg-white rounded-xl shadow-lg border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">District</p>
                  <p className="text-xs font-black text-gray-900 leading-none">Indore</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-gray-900">Nearby Mandis</h4>
                <button className="text-[10px] font-black text-emerald-600 hover:underline">View All</button>
              </div>
              {nearbyMandis.map((mandi, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-emerald-100 transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <Icons.Market size={20} />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-extrabold text-sm text-gray-900 leading-none mb-1">{mandi.name}</h5>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{mandi.dist}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Market Predictions */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Market Predictions</h2>
              <p className="text-gray-500 font-bold text-sm">Real-time rates for <span className="text-emerald-600">Indore, MP</span></p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-xs font-black text-gray-700 flex items-center gap-2">
                <Icons.Settings size={14} className="rotate-90" /> Filter
              </button>
              <button className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-xs font-black text-gray-700 flex items-center gap-2">
                <TrendingUp size={14} /> Sort
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {marketPredictions.map((crop, i) => (
              <GlassCard key={i} className="p-4 flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <div className="relative">
                    <img src={crop.image} alt={crop.name} className="w-16 h-16 rounded-xl object-cover ring-4 ring-gray-50" />
                    <span className={`absolute -top-2 -right-2 px-2 py-0.5 rounded shadow-sm text-[8px] font-black tracking-widest uppercase ${crop.rec === 'SELL' ? 'bg-emerald-500 text-white' : 'bg-orange-100 text-orange-700'
                      }`}>
                      RECOMMENDATION: {crop.rec}
                    </span>
                  </div>
                  <div className="text-right">
                    <h4 className="font-extrabold text-gray-900">{crop.name}</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Indore Mandi</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center py-4">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-3xl font-black text-gray-900 tracking-tight">{crop.price}</h3>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">per Quintal</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black flex items-center gap-1 justify-end ${crop.trend === 'up' ? 'text-emerald-500' : 'text-orange-500'}`}>
                        {crop.trend === 'up' ? '▲' : '▼'} {crop.change}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Range: {crop.range}</p>
                    </div>
                  </div>

                  <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparkData}>
                        <Area
                          type="monotone"
                          dataKey="p"
                          stroke={crop.trend === 'up' ? '#10b981' : '#f97316'}
                          fill={crop.trend === 'up' ? '#10b981' : '#f97316'}
                          fillOpacity={0.15}
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-md shadow-emerald-500/10 transition-all">
                    {crop.rec === 'SELL' ? 'Sell Now Details' : 'View Trends'}
                  </button>
                  <button className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all">
                    <Bell size={16} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPrices;