
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Mic, ImageIcon, X, Trash2, ArrowLeft, MoreVertical, Bell, Filter, MapPin, Droplets, Sun, TrendingUp, AlertTriangle } from 'lucide-react';
import { getAdvisoryResponse } from '../services/geminiService';
import { getCurrentUser } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Icons } from './ui/IconSystem';
import { Button } from './ui/Button';

const AdvisoryChat: React.FC = () => {
  const { t, language } = useLanguage();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<'feed' | 'market' | 'weather' | 'schemes'>('feed');

  // New Feed-based state to match reference
  const advisories = [
    {
      id: 1,
      type: 'Critical Alert',
      tagColor: 'bg-red-50 text-red-500 ring-1 ring-red-100',
      icon: <Droplets className="text-red-500" size={24} />,
      title: 'Groundwater levels critical in your region.',
      location: 'Jaipur, Rajasthan',
      description: 'Water table has dropped by 1.5m this year. Optimize irrigation immediately.',
      action: 'View Control Measures'
    },
    {
      id: 2,
      type: 'Disease Warning',
      tagColor: 'bg-orange-50 text-orange-600 ring-1 ring-orange-100',
      icon: <AlertTriangle className="text-orange-500" size={24} />,
      title: 'High humidity warning: Risk of Wheat Rust.',
      location: 'Jaipur, Rajasthan',
      description: 'Weather conditions are favorable for fungal spread in the next 48 hours.',
      action: 'Read Full Advisory'
    },
    {
      id: 3,
      type: 'Market Trend',
      tagColor: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
      icon: <TrendingUp className="text-emerald-500" size={24} />,
      title: 'Wheat prices expected to rise by 15% in November.',
      location: 'Jaipur, Rajasthan',
      description: 'Supply shortages in neighboring states driving demand up. Consider holding stock.',
      action: 'Market Intelligence'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Top Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Smart Advisory Feed</h1>
          <div className="hidden lg:flex items-center gap-2 bg-white rounded-xl border border-gray-100 p-1 font-bold text-xs ring-4 ring-gray-50/50">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'feed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'market' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Market
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'weather' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Weather
            </button>
            <button
              onClick={() => setActiveTab('schemes')}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'schemes' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Schemes
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-100 font-bold text-xs">
            <span className="text-emerald-500">EN</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">हिन्दी</span>
          </div>
          <button className="p-2 text-gray-400 relative">
            <Bell size={24} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
            {user?.name?.[0] || 'RK'}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left Sidebar: Weather & Filters */}
        <div className="lg:col-span-4 space-y-10">
          {/* Local Weather Card */}
          <div>
            <div className="flex items-center gap-2 mb-4 font-black text-[10px] tracking-widest text-gray-400 uppercase italic">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              Current Conditions
            </div>
            <GlassCard className="p-8 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-extrabold">Local Weather</h3>
                  <Sun size={32} className="text-yellow-300 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <h2 className="text-6xl font-black">32°C</h2>
                  <span className="text-emerald-200 font-bold">Sunny</span>
                </div>
                <p className="text-sm font-bold opacity-80 flex items-center gap-1">
                  <MapPin size={14} /> Jaipur, Rajasthan
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            </GlassCard>
          </div>

          {/* Filters */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 font-black text-[10px] tracking-widest text-gray-400 uppercase">
              <Filter size={14} /> Filters
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-900 uppercase tracking-widest block mb-2">Region</label>
                <select className="w-full p-4 bg-white rounded-xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer">
                  <option>Rajasthan (State)</option>
                  <option>Madhya Pradesh</option>
                  <option>Uttar Pradesh</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-gray-900 uppercase tracking-widest block mb-3">Crop Type</label>
                <div className="space-y-3">
                  {['Wheat', 'Cotton', 'Sugarcane', 'Paddy'].map(crop => (
                    <label key={crop} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-200 text-emerald-500 focus:ring-emerald-500 cursor-pointer" defaultChecked={['Wheat', 'Cotton'].includes(crop)} />
                      <span className="text-sm font-bold text-gray-600 group-hover:text-emerald-600 transition-colors">{crop}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-900 uppercase tracking-widest block mb-3">Alert Type</label>
                <div className="flex flex-wrap gap-2">
                  {['Pesticide', 'Disease', 'Market', 'Weather', 'Govt'].map(type => (
                    <button key={type} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${['Pesticide', 'Disease', 'Market'].includes(type) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-emerald-200 hover:text-emerald-600'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed Content */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence>
            {advisories.map((advisory, idx) => (
              <motion.div
                key={advisory.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <GlassCard className="p-8 border-gray-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all cursor-pointer">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                      {advisory.icon}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${advisory.tagColor}`}>
                          {advisory.type}
                        </span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 italic">
                          <MapPin size={12} /> {advisory.location}
                        </span>
                      </div>

                      <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
                        {advisory.title}
                      </h2>

                      <p className="text-gray-500 font-medium leading-relaxed max-w-2xl">
                        {advisory.description}
                      </p>

                      <div className="flex items-center justify-between pt-4">
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 group-hover:gap-4 transition-all">
                          {advisory.action} <Icons.Dashboard size={14} className="rotate-270" />
                        </button>
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                              <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" />
                            </div>
                          ))}
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 text-[10px] font-black text-emerald-600 flex items-center justify-center">
                            +42
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>

          <button className="w-full py-6 border-2 border-dashed border-gray-100 rounded-2xl text-xs font-black text-gray-400 uppercase tracking-widest hover:border-emerald-300 hover:text-emerald-500 transition-all flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin-slow" /> Load more advisories
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisoryChat;
