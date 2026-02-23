
import React, { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, AlertCircle, Plus, Info, MessageSquare } from 'lucide-react';
import { AppView, WeatherData, MarketPrice } from '../types';
import { getCurrentUser } from '../services/authService';
import { MOCK_MARKET_PRICES, MOCK_WEATHER } from '../constants';
import { motion } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Icons } from './ui/IconSystem';
import { Button } from './ui/Button';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  setView: (view: AppView) => void;
  onDataLoaded?: (weather: WeatherData, prices: MarketPrice[]) => void;
}

const sparklineData = [
  { value: 10 }, { value: 25 }, { value: 15 }, { value: 30 }, { value: 25 }, { value: 40 }, { value: 50 }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Dashboard({ setView }: DashboardProps) {
  const user = getCurrentUser();
  const [loading, setLoading] = useState(false);

  // Mock data for the overhaul visuals
  const stats = [
    {
      label: 'HEATWAVE',
      subLabel: 'Today',
      value: '36°C',
      description: 'Sunny & Clear',
      alert: 'Avg +4°C higher than usual',
      type: 'weather'
    },
    {
      label: 'ACTION NEEDED',
      subLabel: 'Sector 4',
      value: 'Low Moisture',
      description: 'Soil is drying out rapidly.',
      progress: 18,
      target: 40,
      type: 'action'
    },
    {
      label: 'SUBSIDY',
      value: '₹12,450',
      description: 'Total Savings & Credits',
      alert: '+₹500 subsidy added today',
      type: 'subsidy'
    }
  ];

  const marketPredictions = [
    { name: 'Sugarcane', unit: 'Per Quintal', price: '₹285', trend: '+2.4%', status: 'HOLD', color: '#10b981' },
    { name: 'Rice (Basmati)', unit: 'Per Quintal', price: '₹3,200', trend: '+12%', status: 'SELL', color: '#10b981' },
    { name: 'Wheat (Lokwan)', unit: 'Per Quintal', price: '₹2,100', trend: '-1.8%', status: 'HOLD', color: '#ef4444' }
  ];

  const recentScans = [
    { crop: 'Tomato - Sector 2', time: 'Scanned 2 hours ago', status: 'Early Blight', severity: 'critical', image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200&h=200&auto=format&fit=crop' },
    { crop: 'Sugarcane - North', time: 'Scanned Yesterday', status: 'Healthy', severity: 'good', image: 'https://images.unsplash.com/photo-1590050877292-1e967a6b5711?q=80&w=200&h=200&auto=format&fit=crop' }
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header Bar */}
      <motion.div variants={item} className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Daily Feed</h1>
          <p className="text-gray-500 font-medium">Critical updates for your farm today.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2.5 rounded-full bg-white border border-gray-100 text-gray-400 relative">
            <Icons.Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold flex items-center gap-2 text-sm"
          >
            <Plus size={18} />
            New Crop Entry
          </motion.button>
        </div>
      </motion.div>

      {/* Top Grid - Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <GlassCard className="p-6 h-full flex flex-col justify-between overflow-hidden relative">
              {stat.type === 'weather' && (
                <div className="absolute -top-4 -right-4 opacity-10">
                  <Icons.Weather size={120} />
                </div>
              )}
              {stat.type === 'subsidy' && (
                <div className="absolute bottom-0 right-0 opacity-10">
                  <Icons.Market size={100} />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-black tracking-widest leading-none">
                    {stat.label}
                  </span>
                  {stat.subLabel && <span className="text-gray-400 text-xs font-bold">{stat.subLabel}</span>}
                </div>

                <h2 className="text-4xl font-extrabold text-gray-900 mb-1">{stat.value}</h2>
                <p className="text-gray-500 font-bold text-sm mb-4">{stat.description}</p>
              </div>

              {stat.type === 'action' ? (
                <div className="mt-auto">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wide">
                    <span>Current: {stat.progress}%</span>
                    <span>Target: {stat.target}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(stat.progress! / stat.target!) * 100}%` }}
                    ></div>
                  </div>
                  <button className="w-full mt-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all">
                    Start Irrigation
                  </button>
                </div>
              ) : (
                <div className="mt-auto py-2 px-3 rounded-lg bg-orange-50 border border-orange-100 flex items-center gap-2">
                  <AlertCircle size={14} className="text-orange-500" />
                  <span className="text-[11px] font-bold text-orange-700">{stat.alert}</span>
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* Market Price Prediction */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-500" />
                Market Price Prediction
              </h3>
              <button className="text-emerald-600 font-bold text-xs hover:underline">View All Crops</button>
            </div>

            <div className="space-y-4">
              {marketPredictions.map((crop, i) => (
                <div key={i} className="flex items-center gap-6 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-emerald-500">
                    <Icons.Farm size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-gray-900">{crop.name}</h4>
                    <p className="text-xs text-gray-400 font-bold">{crop.unit}</p>
                  </div>
                  <div className="w-32 h-10 hidden sm:block">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparklineData}>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={crop.color}
                          fill={crop.color}
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-gray-900">{crop.price}</p>
                    <p className={`text-xs font-bold ${crop.color === '#ef4444' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {crop.trend.startsWith('+') ? '▲' : '▼'} {crop.trend}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-md text-[10px] font-black tracking-widest ${crop.status === 'SELL' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                    {crop.status}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Scheme Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-emerald-950 p-8 text-white">
            <div className="relative z-10 max-w-sm">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                Government Scheme
              </span>
              <h3 className="text-3xl font-extrabold leading-tight mb-4">
                New Solar Pump Subsidy Available (PM-KUSUM)
              </h3>
              <p className="text-emerald-200/80 text-sm mb-6 font-medium">
                Apply before 30th November to get 60% subsidy on installation.
              </p>
              <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 transition-all text-white font-black rounded-xl text-sm">
                Check Eligibility
              </button>
            </div>
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Right Sidebar - Recent Scans & Community */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-gray-900">Recent Scans</h3>
              <button className="text-gray-400"><Info size={20} /></button>
            </div>

            <div className="space-y-6">
              {recentScans.map((scan, i) => (
                <div key={i} className="flex gap-4">
                  <img src={scan.image} alt={scan.crop} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-sm text-gray-900 truncate">{scan.crop}</h4>
                    <p className="text-[10px] text-gray-400 font-bold mb-2 uppercase tracking-wide">{scan.time}</p>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${scan.severity === 'critical' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${scan.severity === 'critical' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                      {scan.status}
                    </div>
                  </div>
                </div>
              ))}

              <button className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center gap-2 hover:border-emerald-300 transition-all group">
                <div className="p-2 bg-gray-50 rounded-full text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                  <Plus size={20} />
                </div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-emerald-600">Upload from Gallery</span>
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-extrabold text-gray-900 mb-6">Community Forum</h3>
            <div className="space-y-4">
              {[
                { user: 'VK', name: 'Best fertilizer for cotton this month?', replies: 24, time: '12 mins ago' },
                { user: 'AS', name: 'Mandi prices in Nashik are dropping.', replies: 8, time: '1 hour ago' }
              ].map((post, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-700">
                    {post.user}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xs text-gray-900 leading-tight mb-1">{post.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold">{post.replies} replies • {post.time}</p>
                  </div>
                </div>
              ))}
              <button className="w-full text-center text-emerald-600 font-bold text-xs mt-2 hover:underline">
                View Community Discussions
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}