import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, TrendingUp, DollarSign, Navigation, ShoppingBag, Phone, Loader2, Calculator, BrainCircuit, Crosshair, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getHistoricalData } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Icons } from './ui/IconSystem';
import { Button } from './ui/Button';

// Default Data
const DEFAULT_JAMMU_DATA: MarketData = {
  trendingCrops: [
    { name: "Basmati Rice", price: "₹3,850", trend: "up", demand: "Very High" },
    { name: "Kashmiri Apple", price: "₹6,200", trend: "stable", demand: "High" },
    { name: "Walnut", price: "₹28,500", trend: "up", demand: "Medium" },
    { name: "Maize", price: "₹2,150", trend: "down", demand: "Medium" },
    { name: "Rajmash", price: "₹14,000", trend: "up", demand: "High" }
  ],
  mandis: [
    { name: "Narwal Mandi", distance: "8 km", bestFor: "Basmati, Fruits, Veg" },
    { name: "Udhampur Mandi", distance: "65 km", bestFor: "Maize, Seasonal Veg" },
    { name: "Parimpora Mandi", distance: "260 km", bestFor: "Apple, Walnut, Saffron" }
  ],
  buyers: [
    { name: "JK Agro Industries", type: "Processor", contact: "+91 94191 12345", requirements: "Buying high-grade RS Pura Basmati" },
    { name: "Valley Fruit Exports", type: "Exporter", contact: "0191-2456789", requirements: "Bulk procurement of A-Grade Apples" },
    { name: "Dogra Grains", type: "Wholesaler", contact: "+91 99060 98765", requirements: "Need 200 Quintals Maize & Rajmash" }
  ],
  advisory: "Basmati prices from RS Pura belt are peaking due to high export demand. Apples from the valley are seeing stable rates."
};

interface MarketData {
  trendingCrops: Array<{ name: string; price: string; trend: string; demand: string }>;
  mandis: Array<{ name: string; distance: string; bestFor: string }>;
  buyers: Array<{ name: string; type: string; contact: string; requirements: string }>;
  advisory: string;
}

type TimeRange = '1W' | '1M' | '3M' | '6M';

const MarketPrices: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'trends' | 'mandis' | 'buyers' | 'profit'>('trends');
  const [location, setLocation] = useState({ state: 'Jammu and Kashmir', district: 'Jammu' });
  const [isLocating, setIsLocating] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [tempLocation, setTempLocation] = useState({ state: '', district: '' });
  const [marketData, setMarketData] = useState<MarketData>(DEFAULT_JAMMU_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCropIndex, setSelectedCropIndex] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [quantity, setQuantity] = useState<number>(10);
  const [costPerQuintal, setCostPerQuintal] = useState<number>(0);

  useEffect(() => { detectLocation(); }, []);

  const detectLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            const detectedState = data.principalSubdivision || 'Jammu and Kashmir';
            const detectedDistrict = data.city || data.locality || 'Jammu';
            setLocation({ state: detectedState, district: detectedDistrict });
            fetchMarketIntelligence(detectedState, detectedDistrict);
          } catch (error) { console.error("Geo Error:", error); }
          finally { setIsLocating(false); }
        },
        (error) => { console.warn(error); setIsLocating(false); }
      );
    } else { setIsLocating(false); }
  };

  useEffect(() => {
    if (!isLocating) fetchMarketIntelligence(location.state, location.district);
  }, [location, language, isLocating]);

  const fetchMarketIntelligence = async (state: string, district: string) => {
    setIsRefreshing(true);
    try {
      const api = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${api}/api/v1/market/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: `${district}, ${state}`, state, district, language })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.trendingCrops?.length > 0) {
          setMarketData(data);
          if (selectedCropIndex >= data.trendingCrops.length) setSelectedCropIndex(0);
        }
      }
    } catch (error) { console.warn("Using Offline Data"); }
    finally { setIsRefreshing(false); }
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempLocation.state && tempLocation.district) {
      setLocation(tempLocation);
      setManualMode(false);
    }
  };

  const selectedCrop = marketData ? marketData.trendingCrops[selectedCropIndex] : DEFAULT_JAMMU_DATA.trendingCrops[0];

  const chartData = useMemo(() => {
    if (!selectedCrop) return [];
    const price = parseFloat(selectedCrop.price.replace(/[^\d.]/g, '')) || 2000;
    return getHistoricalData(price, timeRange);
  }, [selectedCrop, timeRange]);

  useEffect(() => {
    if (selectedCrop) {
      const price = parseFloat(selectedCrop.price.replace(/[^\d.]/g, '')) || 2000;
      setCostPerQuintal(Math.round(price * 0.6));
    }
  }, [selectedCrop]);

  const profit = useMemo(() => {
    if (!selectedCrop) return 0;
    const price = parseFloat(selectedCrop.price.replace(/[^\d.]/g, '')) || 0;
    return (price * quantity) - (costPerQuintal * quantity);
  }, [selectedCrop, quantity, costPerQuintal]);

  return (
    <div className="h-full space-y-6 pb-24">
      {/* Header & Location */}
      <GlassCard className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-earth-golden to-earth-amber rounded-xl flex items-center justify-center text-white shadow-lg">
            <Icons.Market size={28} />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-deep-earth dark:text-white flex items-center gap-2">
              {t('marketPrices')}
              {isRefreshing && <Loader2 size={16} className="animate-spin text-earth-amber" />}
            </h1>
            <div className="flex items-center gap-2 text-earth-soil dark:text-gray-400 text-sm">
              <MapPin size={14} />
              <span className="font-bold">{location.district}, {location.state}</span>
              <button onClick={() => setManualMode(!manualMode)} className="text-xs text-harvest-green dark:text-sprout-green font-bold underline ml-2">Change</button>
            </div>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={detectLocation} disabled={isLocating} className="rounded-full">
          {isLocating ? <Loader2 size={16} className="animate-spin mr-2" /> : <Crosshair size={16} className="mr-2" />}
          {isLocating ? "Locating..." : "Locate Me"}
        </Button>
      </GlassCard>

      {manualMode && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/80 dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-glass-border">
          <form onSubmit={handleManualLocationSubmit} className="flex gap-2">
            <input
              placeholder="State"
              className="flex-1 p-2 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={tempLocation.state}
              onChange={e => setTempLocation({ ...tempLocation, state: e.target.value })}
            />
            <input
              placeholder="District"
              className="flex-1 p-2 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={tempLocation.district}
              onChange={e => setTempLocation({ ...tempLocation, district: e.target.value })}
            />
            <Button type="submit" size="sm">Update</Button>
          </form>
        </motion.div>
      )}

      {/* Ticker / Advisory */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-deep-earth to-dark-canopy text-white p-4 shadow-lg border border-glass-border">
        <div className="flex items-start gap-4 z-10 relative">
          <div className="bg-white/10 p-2 rounded-full">
            <BrainCircuit size={20} className="text-sprout-green" />
          </div>
          <div>
            <h3 className="font-bold text-sprout-green text-xs uppercase tracking-widest mb-1">AI Market Insight</h3>
            <p className="text-sm font-medium opacity-90">{marketData.advisory}</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-sprout-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/50 dark:bg-black/20 p-1 rounded-xl border border-glass-border overflow-x-auto no-scrollbar">
        {[
          { id: 'trends', label: 'Price Trends', icon: TrendingUp },
          { id: 'mandis', label: 'Nearby Mandis', icon: Navigation },
          { id: 'buyers', label: 'Buyers', icon: ShoppingBag },
          { id: 'profit', label: 'Calculator', icon: Calculator }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-harvest-green text-white shadow-md'
                : 'text-earth-soil dark:text-gray-400 hover:bg-white/30 dark:hover:bg-white/5'
              }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Crop Scroller */}
              <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                {marketData.trendingCrops.map((crop, i) => (
                  <GlassCard
                    key={i}
                    onClick={() => setSelectedCropIndex(i)}
                    className={`min-w-[140px] p-4 cursor-pointer transition-all border-2 ${selectedCropIndex === i
                        ? 'border-harvest-green bg-gradient-to-br from-harvest-green/10 to-transparent scale-105'
                        : 'border-transparent hover:border-glass-border'
                      }`}
                  >
                    <p className="text-sm font-bold text-deep-earth dark:text-white truncate">{crop.name}</p>
                    <p className="text-lg font-black text-harvest-green dark:text-sprout-green mt-1">{crop.price}</p>
                    <div className={`mt-2 text-xs font-bold flex items-center gap-1 ${crop.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                      {crop.trend === 'up' ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                      {crop.trend === 'up' ? 'Rising' : 'Falling'}
                    </div>
                  </GlassCard>
                ))}
              </div>

              {selectedCrop && (
                <GlassCard className="p-6">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h3 className="text-4xl font-display font-bold text-deep-earth dark:text-white">{selectedCrop.price}</h3>
                      <p className="text-earth-soil dark:text-gray-400 font-medium">{selectedCrop.name} Price History</p>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-white/10 rounded-lg p-1">
                      {(['1W', '1M', '3M', '6M'] as TimeRange[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setTimeRange(r)}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeRange === r
                              ? 'bg-white dark:bg-deep-earth shadow-sm text-deep-earth dark:text-white'
                              : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1a6b3c" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#1a6b3c" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} minTickGap={30} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'rgba(255, 255, 255, 0.9)' }}
                        />
                        <Area type="monotone" dataKey="price" stroke="#1a6b3c" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}

          {activeTab === 'mandis' && (
            <motion.div key="mandis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {marketData.mandis.map((mandi, i) => (
                <GlassCard key={i} className="p-6 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600">
                      <Navigation size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-deep-earth dark:text-white">{mandi.name}</h3>
                      <p className="text-sm font-medium text-earth-soil dark:text-gray-400">{mandi.distance} away</p>
                      <span className="inline-block mt-2 text-xs font-bold bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                        {mandi.bestFor}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="text-gray-300 group-hover:text-orange-500 transition-colors" />
                </GlassCard>
              ))}
            </motion.div>
          )}

          {activeTab === 'buyers' && (
            <motion.div key="buyers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-4">
              {marketData.buyers.map((buyer, i) => (
                <GlassCard key={i} className="p-6 hover:border-sprout-green/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-deep-earth dark:text-white">{buyer.name}</h3>
                      <span className="text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full">{buyer.type}</span>
                    </div>
                    <a href={`tel:${buyer.contact}`} className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform">
                      <Phone size={18} />
                    </a>
                  </div>
                  <div className="pt-4 border-t border-glass-border">
                    <p className="text-xs font-bold text-earth-soil/60 uppercase tracking-wider mb-1">Requirements</p>
                    <p className="text-sm font-medium text-deep-earth dark:text-gray-300">{buyer.requirements}</p>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}

          {activeTab === 'profit' && selectedCrop && (
            <motion.div key="profit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard className="p-8">
                <h3 className="font-bold text-xl text-deep-earth dark:text-white mb-8 flex items-center gap-3">
                  <Calculator size={24} className="text-earth-golden" />
                  Profit Estimator for <span className="text-harvest-green dark:text-sprout-green">{selectedCrop.name}</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <label className="text-sm font-bold text-earth-soil dark:text-gray-400 mb-2 block">Quantity to Sell</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(Number(e.target.value))}
                        className="w-full p-4 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-2xl font-black outline-none focus:ring-2 focus:ring-harvest-green text-deep-earth dark:text-white"
                      />
                      <span className="absolute right-4 top-4 text-sm font-bold text-gray-400 mt-1">Quintals</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-earth-soil dark:text-gray-400 mb-2 block">Cost per Quintal</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={costPerQuintal}
                        onChange={e => setCostPerQuintal(Number(e.target.value))}
                        className="w-full p-4 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-2xl font-black outline-none focus:ring-2 focus:ring-harvest-green text-deep-earth dark:text-white"
                      />
                      <span className="absolute right-4 top-4 text-sm font-bold text-gray-400 mt-1">₹</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-harvest-green to-leaf-green p-6 rounded-2xl text-white flex justify-between items-center shadow-lg shadow-green-500/20">
                  <div>
                    <p className="font-medium opacity-90">Estimated Net Profit</p>
                    <p className="text-xs opacity-75">Based on market price: {selectedCrop.price}</p>
                  </div>
                  <p className="text-4xl font-display font-bold">₹{profit.toLocaleString()}</p>
                </div>
              </GlassCard>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default MarketPrices;