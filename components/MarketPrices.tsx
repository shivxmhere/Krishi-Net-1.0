import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, TrendingUp, DollarSign, Navigation, ShoppingBag, Phone, Loader2, Calculator, BrainCircuit, Crosshair } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getHistoricalData } from '../constants';

// --- HYBRID DATA STRATEGY: Default Data avoids empty screen ---
const DEFAULT_JAMMU_DATA: MarketData = {
  trendingCrops: [
    { name: "Basmati Rice (RS Pura)", price: "₹3,850", trend: "up", demand: "Very High" },
    { name: "Apple (Kashmiri)", price: "₹6,200", trend: "stable", demand: "High" },
    { name: "Walnut (Kagzi)", price: "₹28,500", trend: "up", demand: "Medium" },
    { name: "Maize (Hybrid)", price: "₹2,150", trend: "down", demand: "Medium" },
    { name: "Rajmash (Bhaderwah)", price: "₹14,000", trend: "up", demand: "High" }
  ],
  mandis: [
    { name: "Narwal Mandi (Jammu)", distance: "8 km", bestFor: "Basmati, Fruits, Veg" },
    { name: "Udhampur Mandi", distance: "65 km", bestFor: "Maize, Seasonal Veg" },
    { name: "Parimpora Mandi (Srinagar)", distance: "260 km", bestFor: "Apple, Walnut, Saffron" }
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

  // Use DEFAULT data initially so screen is NEVER empty
  const [marketData, setMarketData] = useState<MarketData>(DEFAULT_JAMMU_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Chart State
  const [selectedCropIndex, setSelectedCropIndex] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');

  // Profit Calc State
  const [quantity, setQuantity] = useState<number>(10); // Quintals
  const [costPerQuintal, setCostPerQuintal] = useState<number>(0);

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use free reverse geocoding API
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();

            const detectedState = data.principalSubdivision || 'Jammu and Kashmir';
            const detectedDistrict = data.city || data.locality || 'Jammu';

            setLocation({ state: detectedState, district: detectedDistrict });
            fetchMarketIntelligence(detectedState, detectedDistrict);
          } catch (error) {
            console.error("Geo Error:", error);
            // Fallback is already set (Jammu)
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.warn("Location permission denied or unavailable", error);
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    // Only fetch if not already fetched by detectLocation (to avoid double calls)
    if (!isLocating) {
      fetchMarketIntelligence(location.state, location.district);
    }
  }, [location, language, isLocating]);

  const fetchMarketIntelligence = async (state: string, district: string) => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8000'}/api/v1/market/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: `${district}, ${state}`,
          state: state,
          district: district,
          language: language
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Only update if we got valid data structure
        if (data && data.trendingCrops && data.trendingCrops.length > 0) {
          setMarketData(data);
          // Verify index logic
          if (selectedCropIndex >= data.trendingCrops.length) {
            setSelectedCropIndex(0);
          }
        }
      }
    } catch (error) {
      console.warn("Using Offline Data for Market");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempLocation.state && tempLocation.district) {
      setLocation(tempLocation);
      setManualMode(false);
    }
  };

  const selectedCrop = marketData ? marketData.trendingCrops[selectedCropIndex] : DEFAULT_JAMMU_DATA.trendingCrops[0];

  // Generate chart data on the fly based on current price
  const chartData = useMemo(() => {
    if (!selectedCrop) return [];
    const price = parseFloat(selectedCrop.price.replace(/[^\d.]/g, '')) || 2000;
    return getHistoricalData(price, timeRange);
  }, [selectedCrop, timeRange]);

  // Update cost when crop changes
  useEffect(() => {
    if (selectedCrop) {
      const price = parseFloat(selectedCrop.price.replace(/[^\d.]/g, '')) || 2000;
      setCostPerQuintal(Math.round(price * 0.6));
    }
  }, [selectedCrop]);

  const profit = useMemo(() => {
    if (!selectedCrop) return 0;
    const price = parseFloat(selectedCrop.price.replace(/[^\d.]/g, '')) || 0;
    const revenue = price * quantity;
    const totalCost = costPerQuintal * quantity;
    return revenue - totalCost;
  }, [selectedCrop, quantity, costPerQuintal]);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            {t('marketPrices')}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
              Insights for <span className="font-bold text-gray-700 dark:text-gray-200">{location.district}, {location.state}</span>
              {isRefreshing && <Loader2 className="w-3 h-3 animate-spin text-green-600" />}
            </p>
            <button
              onClick={() => setManualMode(!manualMode)}
              className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-300 transition-colors"
            >
              Change
            </button>
          </div>
        </div>

        <button
          onClick={detectLocation}
          disabled={isLocating}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition-colors"
        >
          {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          {isLocating ? "Locating..." : "Track My Location"}
        </button>
      </div>

      {/* Manual Location Form */}
      {manualMode && (
        <form onSubmit={handleManualLocationSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6 border border-blue-100 dark:border-blue-900 animate-fade-in">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Set Location Manually</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="State (e.g. Punjab)"
              className="flex-1 p-2 border rounded-lg active:ring-2 ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
              onChange={(e) => setTempLocation({ ...tempLocation, state: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="District (e.g. Ludhiana)"
              className="flex-1 p-2 border rounded-lg active:ring-2 ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
              onChange={(e) => setTempLocation({ ...tempLocation, district: e.target.value })}
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
              Update
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">

        {/* AI Advisory Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">AI Market Insight</h3>
              <p className="text-blue-100 leading-relaxed">{marketData.advisory}</p>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex overflow-x-auto">
          {[
            { id: 'trends', label: 'Price Charts', icon: TrendingUp },
            { id: 'mandis', label: 'Nearby Mandis', icon: Navigation },
            { id: 'buyers', label: 'Verified Buyers', icon: ShoppingBag },
            { id: 'profit', label: 'Profit Calculator', icon: Calculator }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${activeTab === tab.id
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}

        {/* 1. PRICE TRENDS (CHARTS) */}
        {activeTab === 'trends' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            {/* Crop Selector */}
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
              {marketData.trendingCrops?.map((crop, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCropIndex(i)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${selectedCropIndex === i
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300'
                    }`}
                >
                  {crop.name}
                </button>
              ))}
            </div>

            {selectedCrop && (
              <>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedCrop.price}</h3>
                    <p className={`flex items-center gap-1 text-sm font-medium mt-1 ${selectedCrop.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                      {selectedCrop.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                      {selectedCrop.trend === 'up' ? 'Trending Up' : 'Trending Down'} • High Demand
                    </p>
                  </div>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    {(['1W', '1M', '3M', '6M'] as TimeRange[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setTimeRange(r)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeRange === r
                          ? 'bg-white dark:bg-gray-600 shadow-sm text-black dark:text-white'
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
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        minTickGap={30}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {/* 2. NEARBY MANDIS */}
        {activeTab === 'mandis' && (
          <div className="grid gap-4">
            {marketData.mandis?.map((mandi, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm flex items-center justify-between border-l-4 border-orange-500">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                    <Navigation className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{mandi.name}</h3>
                    <p className="text-sm text-gray-500">{mandi.distance} away</p>
                    <span className="inline-block mt-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                      Best for: {mandi.bestFor}
                    </span>
                  </div>
                </div>
                <button className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full text-gray-600 dark:text-gray-300 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                  <Navigation className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 3. VERIFIED BUYERS */}
        {activeTab === 'buyers' && (
          <div className="grid md:grid-cols-2 gap-4">
            {marketData.buyers?.map((buyer, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{buyer.name}</h3>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-2 py-0.5 rounded-full">{buyer.type}</span>
                  </div>
                  <a href={`tel:${buyer.contact}`} className="bg-green-500 text-white p-2 rounded-full shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors">
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Requirements</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{buyer.requirements}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. PROFIT CALCULATOR */}
        {activeTab === 'profit' && selectedCrop && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-fade-in">
            <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-gray-400" />
              Profit Estimator for {selectedCrop.name}
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Quantity to Sell (Quintals)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-lg font-bold dark:text-white"
                  />
                  <span className="absolute right-4 top-4 text-gray-400 font-medium">Qtl</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Estimated Cost per Quintal (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={costPerQuintal}
                    onChange={(e) => setCostPerQuintal(Number(e.target.value))}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-lg font-bold dark:text-white"
                  />
                  <span className="absolute right-4 top-4 text-gray-400 font-medium">₹/Qtl</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-green-800 dark:text-green-300 font-medium mb-1">Estimated Net Profit</p>
                <p className="text-sm text-green-600/70">Based on current market price of {selectedCrop.price}</p>
              </div>
              <div className="text-4xl font-black text-green-600 dark:text-green-400">
                ₹{profit.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPrices;