
import { MarketPrice, WeatherData, Crop } from './types';

export const MOCK_WEATHER: WeatherData = {
  temp: 28,
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 12,
  forecast: [
    { day: 'Today', temp: 28, rainChance: 10 },
    { day: 'Tomorrow', temp: 27, rainChance: 40 },
    { day: 'Wed', temp: 26, rainChance: 80 },
    { day: 'Thu', temp: 29, rainChance: 20 },
    { day: 'Fri', temp: 30, rainChance: 0 },
  ]
};

export const MOCK_MARKET_PRICES: MarketPrice[] = [
  { crop: 'Wheat', mandi: 'Azadpur', price: 2150, change: 2.5, trend: 'up' },
  { crop: 'Rice (Basmati)', mandi: 'Karnal', price: 3800, change: -1.2, trend: 'down' },
  { crop: 'Tomato', mandi: 'Kolar', price: 1200, change: 15.0, trend: 'up' },
  { crop: 'Onion', mandi: 'Nashik', price: 1800, change: 5.0, trend: 'up' },
  { crop: 'Cotton', mandi: 'Rajkot', price: 6200, change: 0.5, trend: 'stable' },
  { crop: 'Potato', mandi: 'Agra', price: 900, change: -5.0, trend: 'down' },
];

export const getHistoricalData = (basePrice: number, period: '1W' | '1M' | '3M' | '6M') => {
  const daysMap = { '1W': 7, '1M': 30, '3M': 90, '6M': 180 };
  const days = daysMap[period];
  
  let price = basePrice;
  const history = [];
  
  // Generate backwards from today to ensure the last point matches current price
  for (let i = 0; i < days; i++) {
     const date = new Date();
     date.setDate(date.getDate() - i);
     
     history.unshift({
       date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
       price: Math.round(price)
     });
     
     // Random walk backwards to simulate history
     // More volatility for longer periods to look realistic
     const volatility = 0.02; // 2% daily change
     const change = (Math.random() - 0.5) * volatility;
     price = price * (1 - change);
  }
  
  return history;
};

// INITIAL_CROPS is now empty to support the "My Farm Empty State" requirement
export const INITIAL_CROPS: Crop[] = [];

export const SUGGESTED_QUESTIONS = [
  "How much fertilizer for 2 acres of wheat?",
  "It rained heavily yesterday, what should I check?",
  "Best time to sow cotton in Gujarat?",
  "How to control aphids organically?"
];
