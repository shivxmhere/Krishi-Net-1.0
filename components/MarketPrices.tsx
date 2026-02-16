import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, Calculator, MapPin, DollarSign, BrainCircuit, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getHistoricalData } from '../constants';
import { MarketPrice, NearbyMarket } from '../types';
import { getSellOrHoldAdvisory, getLocationBasedData } from '../services/geminiService';
import { getCurrentUser } from '../services/authService';

type TimeRange = '1W' | '1M' | '3M' | '6M';

const MarketPrices: React.FC = () => {
  const user = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [localPrices, setLocalPrices] = useState<MarketPrice[]>([]);
  const [nearbyMarkets, setNearbyMarkets] = useState<NearbyMarket[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<MarketPrice | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [activeTab, setActiveTab] = useState<'trends' | 'nearby' | 'advisory'>('trends');
  
  // Advisory State
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisory, setAdvisory] = useState<{ recommendation: 'SELL' | 'HOLD'; reason: string } | null>(null);

  useEffect(() => {
    const fetchLocalPrices = async () => {
      if (user?.location) {
        setLoading(true);
        const data = await getLocationBasedData(user.location);
        if (data && data.marketPrices) {
          setLocalPrices(data.marketPrices);
          if (data.nearbyMarkets) setNearbyMarkets(data.nearbyMarkets);
          if (data.marketPrices.length > 0) setSelectedCrop(data.marketPrices[0]);
        }
        setLoading(false);
      }
    };
    fetchLocalPrices();
  }, [user?.location]);
  
  const chartData = useMemo(() => {
    if (!selectedCrop) return [];
    return getHistoricalData(selectedCrop.price, timeRange);
  }, [selectedCrop, timeRange]);

  const ranges: { label: string; value: TimeRange }[] = [
    { label: '1 Week', value: '1W' },
    { label: '1 Month', value: '1M' },
    { label: '3 Months', value: '3M' },
    { label: '6 Months', value: '6M' },
  ];

  const handleGetAdvisory = async () => {
    if (!selectedCrop) return;
    setAdvisoryLoading(true);
    const result = await getSellOrHoldAdvisory(
      selectedCrop.crop,
      selectedCrop.price,
      selectedCrop.trend === 'up' ? 'Rising' : 'Falling',
      user?.location || 'Unknown'
    );
    setAdvisory(result);
    setAdvisoryLoading(false);
  };

  // Profit Calc State
  const [quantity, setQuantity] = useState<number>(10); // Quintals
  const [costPerQuintal, setCostPerQuintal] = useState<number>(0);
  
  // Update default cost when crop changes
  useEffect(() => {
    if (selectedCrop) {
      // Assume cost is roughly 60% of price for default
      setCostPerQuintal(Math.round(selectedCrop.price * 0.6));
    }
  }, [selectedCrop]);

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500 gap-4">
          <Loader2 className="animate-spin w-8 h-8 text-green-600" />
          <p>Fetching live market data for {user?.location}...</p>
        </div>
      );
  }

  if (!selectedCrop) {
    return (
      <div className="text-center p-12 text-gray-500">
        <p>No market data available for this location. Please update your location settings.</p>
      </div>
    );
  }

  const revenue = selectedCrop.price * quantity;
  const totalCost = costPerQuintal * quantity;
  const profit = revenue - totalCost;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Market Intelligence</h2>
          <p className="text-gray-500 text-sm">Real-time prices for {user?.location || 'your area'}</p>
        </div>
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          {[
            { id: 'trends', label: 'Price Trends' },
            { id: 'nearby', label: 'Nearby Markets' },
            { id: 'advisory', label: 'Sell Advisory & Profit' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Price List (Always Visible) */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">Select Crop</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            {localPrices.map((item, index) => (
              <div 
                key={index} 
                onClick={() => {
                  setSelectedCrop(item);
                  setAdvisory(null);
                }}
                className={`p-4 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  selectedCrop.crop === item.crop 
                    ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500' 
                    : 'dark:text-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-gray-900 dark:text-white">{item.crop}</h4>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    item.trend === 'up' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' 
                      : item.trend === 'down' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                     {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '-'} {Math.abs(item.change)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{item.mandi}</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{item.price}/Qtl</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area Based on Tab */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB: TRENDS */}
          {activeTab === 'trends' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full animate-fade-in">
               <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{selectedCrop.crop} Price History</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCrop.mandi} Mandi</p>
                </div>
                <div className="flex gap-2">
                  {ranges.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setTimeRange(r.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        timeRange === r.value 
                          ? 'bg-black text-white dark:bg-white dark:text-black' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
               </div>

               <div className="flex-1 min-h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                     <defs>
                       <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                     <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#9ca3af', fontSize: 12}} 
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#9ca3af', fontSize: 12}} 
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
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
          )}

          {/* TAB: NEARBY MARKETS */}
          {activeTab === 'nearby' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Nearby Mandi Comparison</h3>
              <div className="space-y-4">
                 {nearbyMarkets.map((market, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 dark:text-white">{market.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{market.distance} away</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="font-bold text-lg text-gray-800 dark:text-white">
                           ₹{selectedCrop.price + market.priceDiff}
                         </p>
                         <p className={`text-xs font-semibold ${market.priceDiff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                           {market.priceDiff > 0 ? '+' : ''}{market.priceDiff} vs avg
                         </p>
                      </div>
                   </div>
                 ))}
                 {nearbyMarkets.length === 0 && (
                   <div className="text-center text-gray-400 py-10">
                     No nearby market data available via AI.
                   </div>
                 )}
              </div>
            </div>
          )}

          {/* TAB: ADVISORY & PROFIT */}
          {activeTab === 'advisory' && (
            <div className="space-y-6 animate-fade-in">
              {/* AI Advisory Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-indigo-100 font-medium uppercase tracking-wider text-sm flex items-center gap-2 mb-4">
                    <BrainCircuit className="w-4 h-4" /> AI Recommendation
                  </h3>
                  
                  {!advisory ? (
                    <div className="text-center py-6">
                      <p className="mb-4 text-indigo-100">Get AI analysis on whether to sell {selectedCrop.crop} now or wait.</p>
                      <button 
                        onClick={handleGetAdvisory}
                        disabled={advisoryLoading}
                        className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors disabled:opacity-70"
                      >
                        {advisoryLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Market'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg ${
                         advisory.recommendation === 'SELL' ? 'bg-green-400 text-green-900' : 'bg-orange-400 text-orange-900'
                       }`}>
                         {advisory.recommendation}
                       </div>
                       <div>
                         <p className="text-xl font-bold mb-1">
                           {advisory.recommendation === 'SELL' ? 'Good time to sell!' : 'Hold your stock'}
                         </p>
                         <p className="text-indigo-100 text-sm leading-relaxed max-w-md">{advisory.reason}</p>
                         <button 
                           onClick={() => setAdvisory(null)}
                           className="text-xs text-indigo-200 mt-2 hover:text-white underline"
                         >
                           Refresh Analysis
                         </button>
                       </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profit Calculator */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                 <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                   <Calculator className="w-5 h-5 text-gray-400" />
                   Profit Estimator
                 </h3>
                 
                 <div className="grid grid-cols-2 gap-4 mb-6">
                   <div>
                     <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Quantity (Quintals)</label>
                     <input 
                       type="number" 
                       value={quantity}
                       onChange={(e) => setQuantity(Number(e.target.value))}
                       className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                     />
                   </div>
                   <div>
                     <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Est. Cost per Quintal (₹)</label>
                     <input 
                       type="number" 
                       value={costPerQuintal}
                       onChange={(e) => setCostPerQuintal(Number(e.target.value))}
                       className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none dark:text-white"
                     />
                   </div>
                 </div>

                 <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl flex justify-between items-center">
                    <span className="text-green-800 dark:text-green-300 font-medium">Estimated Net Profit</span>
                    <span className="text-2xl font-bold text-green-700 dark:text-green-400">₹{profit.toLocaleString()}</span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketPrices;