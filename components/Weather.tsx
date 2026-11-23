import React, { useState } from 'react';
import { CloudSun, Search, ExternalLink, MapPin, Droplets, Wind, Thermometer, RefreshCw } from 'lucide-react';
import { getCurrentUser } from '../services/authService';

type Forecast = { day: string; temp: number; rainChance: number };
type WeatherResponse = { temp: number; condition: string; humidity: number; windSpeed: number; forecast: Forecast[]; observed_at?: string; source?: string; error?: string };
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

export default function Weather() {
  const saved = getCurrentUser()?.location?.split(',')[0]?.trim() || '';
  const [location, setLocation] = useState(saved);
  const [searched, setSearched] = useState('');
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load(e?: React.FormEvent) {
    e?.preventDefault();
    const city = location.trim();
    if (!city || busy) return;
    setBusy(true); setError(''); setData(null);
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 15000);
      let response: Response;
      try {
        response = await fetch(`${API_URL}/api/v1/weather/?location=${encodeURIComponent(city)}`, {signal:controller.signal});
      } finally { clearTimeout(id); }
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.error) throw new Error(body.detail || body.error || 'Weather data unavailable');
      setData(body); setSearched(city);
    } catch(err: any) {
      setError(err?.name === 'AbortError' ? 'Weather request timed out. Try again.' : (err?.message || 'Could not fetch weather.'));
    } finally { setBusy(false); }
  }

  return <div className="max-w-6xl mx-auto space-y-7">
    <header>
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3"><CloudSun className="text-emerald-600"/> Weather & Forecast</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">Search by city or district for a sourced local forecast.</p>
    </header>
    <form onSubmit={load} className="flex flex-wrap gap-3 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4">
      <label className="sr-only" htmlFor="weather-location">City or district</label>
      <input id="weather-location" required minLength={2} maxLength={100} value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Patna, Delhi, Srinagar"
        className="min-w-[220px] flex-1 rounded-xl border dark:border-gray-600 dark:bg-gray-900 p-3"/>
      <button type="submit" disabled={busy} className="flex gap-2 justify-center items-center rounded-xl bg-emerald-600 text-white font-bold px-6 py-3 disabled:opacity-50 hover:bg-emerald-700">
        {busy ? <RefreshCw className="animate-spin" size={18}/> : <Search size={18}/>} Check weather
      </button>
    </form>
    {error && <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>}
    {!data && !error && <div className="p-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-center">
      <CloudSun size={44} className="mx-auto mb-3"/>
      <p className="font-bold">Enter a location and select Check weather to see its forecast.</p>
    </div>}
    {data && <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-600 text-white p-7 md:p-10">
        <div className="flex items-center gap-2 font-semibold"><MapPin size={18}/>{searched}</div>
        <div className="mt-4 flex flex-wrap gap-6 items-center justify-between">
          <div><h2 className="text-6xl font-extrabold">{data.temp}°C</h2><p className="text-emerald-50 font-semibold mt-2">{data.condition}</p></div>
          <CloudSun className="text-yellow-200" size={76}/>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl p-4"><Droplets size={22}/> Humidity <strong>{data.humidity}%</strong></div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl p-4"><Wind size={22}/> Wind <strong>{data.windSpeed} km/h</strong></div>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4">Upcoming forecast</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.forecast.map(item=><div key={item.day} className="rounded-2xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500">{new Date(item.day).toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})}</p>
            <p className="text-2xl font-extrabold mt-2 text-gray-900 dark:text-white flex gap-2 items-center"><Thermometer size={22} className="text-emerald-600"/>{item.temp}°C</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2"><Droplets size={16} className="inline mr-1"/> Rain chance {item.rainChance ?? 'N/A'}%</p>
          </div>)}
        </div>
      </section>
      <p className="text-sm text-gray-600 dark:text-gray-300">Source: Open-Meteo. Forecasts can change. For severe-weather warnings, consult official meteorological alerts.
        {' '}<a className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 underline" target="_blank" rel="noopener noreferrer" href="https://open-meteo.com/">Open-Meteo <ExternalLink size={14}/></a>
      </p>
    </div>}
  </div>;
}
