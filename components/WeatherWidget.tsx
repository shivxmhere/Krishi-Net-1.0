import React, { useEffect, useState } from 'react';
import { CloudRain, Sun, Wind, Droplets, Cloud } from 'lucide-react';
import { getWeatherInsight } from '../services/geminiService';
import { WeatherData } from '../types';

interface WeatherWidgetProps {
  data: WeatherData;
  location: string;
}

export default function WeatherWidget({ data, location }: WeatherWidgetProps) {
  const [insight, setInsight] = useState<string>("Analyzing weather conditions...");
  
  useEffect(() => {
    const fetchInsight = async () => {
      const summary = `${data.condition}, ${data.temp}C, ${data.forecast[1].rainChance}% rain chance tomorrow.`;
      const tip = await getWeatherInsight(summary);
      setInsight(tip);
    };
    fetchInsight();
  }, [data]);

  return (
    <div className="bg-gradient-to-br from-farm-blue-500 to-agri-green-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border-4 border-white">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full -ml-12 -mb-12 blur-lg"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-black bg-white/50 px-2 py-0.5 rounded-md font-bold text-xs uppercase tracking-wider inline-block">Current Weather</h3>
            <p className="text-3xl font-black mt-2 leading-tight shadow-black drop-shadow-md">{location.split(',')[0]}</p>
            <p className="text-xs font-bold text-white/90">{location.split(',').slice(1).join(',')}</p>
          </div>
          <div className="bg-white/30 p-2 rounded-xl backdrop-blur-md border border-white/40 shadow-sm">
            {data.condition.includes('Sun') || data.condition.includes('Clear') ? <Sun className="w-8 h-8 text-yellow-300" /> : <Cloud className="w-8 h-8 text-white" />}
          </div>
        </div>

        <div className="flex items-end gap-4 mb-8">
          <h2 className="text-6xl font-black drop-shadow-sm">{data.temp}°</h2>
          <p className="text-xl text-white mb-2 font-bold">{data.condition}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-white text-xs font-bold mb-1">
              <Droplets className="w-3 h-3" /> Humidity
            </div>
            <p className="font-bold text-lg">{data.humidity}%</p>
          </div>
          <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-white text-xs font-bold mb-1">
              <Wind className="w-3 h-3" /> Wind
            </div>
            <p className="font-bold text-lg">{data.windSpeed} km/h</p>
          </div>
          <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-white text-xs font-bold mb-1">
              <CloudRain className="w-3 h-3" /> Rain
            </div>
            <p className="font-bold text-lg">{data.forecast[0].rainChance}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 text-black shadow-lg border-l-8 border-agri-green-600">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-farm-blue-100 flex items-center justify-center shrink-0">
              <Sun className="w-4 h-4 text-farm-blue-600" />
            </div>
            <div>
              <h4 className="font-black text-sm text-black">AI Farming Tip</h4>
              <p className="text-sm font-semibold text-gray-800 mt-1 leading-relaxed">{insight}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}