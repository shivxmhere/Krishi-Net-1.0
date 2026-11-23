import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ExternalLink, Search, MapPin, Trash2, Plus, Info, ArrowUpDown } from 'lucide-react';

type Watch = { id: string; crop: string; region: string };
const KEY = 'krishi_market_watches_v1';
const resources = [
  { name: 'AGMARKNET', detail: 'Government agricultural market information', url: 'https://agmarknet.gov.in/' },
  { name: 'eNAM', detail: 'National Agriculture Market platform', url: 'https://enam.gov.in/web/' },
  { name: 'data.gov.in', detail: 'Open government data and agriculture datasets', url: 'https://www.data.gov.in/' },
];

function readWatches(): Watch[] {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(data) ? data.filter(x => typeof x.crop === 'string' && typeof x.region === 'string') : [];
  } catch { return []; }
}

export default function MarketPrices() {
  const [query, setQuery] = useState('');
  const [crop, setCrop] = useState('');
  const [region, setRegion] = useState('');
  const [watches, setWatches] = useState<Watch[]>(readWatches);
  const [sortAsc, setSortAsc] = useState(true);
  const [notice, setNotice] = useState('');
  const filtered = useMemo(() => watches.filter(w => `${w.crop} ${w.region}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a,b) => (sortAsc ? 1 : -1)*a.crop.localeCompare(b.crop)), [watches, query, sortAsc]);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(watches)); }, [watches]);

  function addWatch(e: React.FormEvent) {
    e.preventDefault();
    const c = crop.trim(), r = region.trim();
    if (!c || !r) { setNotice('Enter both a crop and a market or district.'); return; }
    if (watches.some(w => w.crop.toLowerCase() === c.toLowerCase() && w.region.toLowerCase() === r.toLowerCase())) {
      setNotice('This crop and region are already in your watchlist.'); return;
    }
    setWatches(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, crop: c, region: r }]);
    setCrop(''); setRegion('');
    setNotice('Saved to this browser. Automatic price alerts require a verified live-data source and are not active yet.');
  }
  function removeWatch(id: string) { setWatches(prev => prev.filter(x => x.id !== id)); setNotice('Watch removed.'); }

  return <div className="max-w-6xl mx-auto space-y-7">
    <header>
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Market Intelligence</h1>
      <p className="text-gray-600 dark:text-gray-300 mt-2">Research agricultural markets and organize crops you want to follow.</p>
    </header>
    <div role="status" className="flex gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-900">
      <Info size={20} className="shrink-0 mt-0.5"/>
      <p className="text-sm"><strong>Live price feed not connected.</strong> We do not display fabricated mandi prices or buy/sell predictions. Use the official data resources below to verify current rates. Watchlist entries are saved on this device and do not send notifications.</p>
    </div>
    <section className="grid gap-5 md:grid-cols-3">
      {resources.map(item => <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer"
        className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-gray-700 hover:border-emerald-500 hover:shadow-md transition-all">
        <div><h2 className="font-extrabold text-lg text-gray-900 dark:text-white">{item.name}</h2><p className="text-sm text-gray-500 dark:text-gray-300 mt-2">{item.detail}</p></div>
        <span className="mt-5 inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">Open official source <ExternalLink size={16}/></span>
      </a>)}
    </section>
    <section className="grid gap-6 lg:grid-cols-5">
      <form onSubmit={addWatch} className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700 space-y-4">
        <h2 className="font-extrabold text-xl text-gray-900 dark:text-white">Watch a crop</h2>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Crop
          <input value={crop} onChange={e=>setCrop(e.target.value)} maxLength={80} placeholder="e.g. Wheat" required className="w-full mt-2 rounded-xl p-3 border dark:bg-gray-900 dark:border-gray-600" />
        </label>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Mandi / district
          <input value={region} onChange={e=>setRegion(e.target.value)} maxLength={100} placeholder="e.g. Patna" required className="w-full mt-2 rounded-xl p-3 border dark:bg-gray-900 dark:border-gray-600" />
        </label>
        <button type="submit" className="w-full flex justify-center items-center gap-2 bg-emerald-600 text-white rounded-xl py-3 font-bold hover:bg-emerald-700"><Plus size={18}/> Add to watchlist</button>
        {notice && <p role="status" className="text-sm text-emerald-800 dark:text-emerald-300">{notice}</p>}
      </form>
      <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between gap-3 flex-wrap items-center">
          <h2 className="font-extrabold text-xl text-gray-900 dark:text-white">My watchlist ({watches.length})</h2>
          <button type="button" onClick={() => setSortAsc(v=>!v)} className="text-sm flex gap-2 items-center text-emerald-700 dark:text-emerald-300 font-semibold">
            <ArrowUpDown size={16}/> Sort {sortAsc ? 'A–Z' : 'Z–A'}
          </button>
        </div>
        <label className="relative block mt-4">
          <Search size={18} className="absolute top-3 left-3 text-gray-400"/>
          <span className="sr-only">Search watched crops or regions</span>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search crops or regions" className="w-full pl-10 pr-3 py-2.5 border rounded-xl dark:bg-gray-900 dark:border-gray-600"/>
        </label>
        <div className="mt-5 space-y-3">
          {!filtered.length && <p className="text-gray-500 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 p-4">{query ? 'No matching crops.' : 'Your watchlist is empty. Add a crop and region to get started.'}</p>}
          {filtered.map(w => <div key={w.id} className="flex justify-between items-center gap-4 p-4 border dark:border-gray-700 rounded-xl">
            <div><p className="font-extrabold text-gray-900 dark:text-white">{w.crop}</p><p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14}/>{w.region}</p></div>
            <div className="flex items-center gap-3">
              <span title="Automatic alerts are not enabled" className="text-gray-400"><Bell size={18}/></span>
              <button type="button" onClick={()=>removeWatch(w.id)} aria-label={`Remove ${w.crop} in ${w.region}`} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
            </div>
          </div>)}
        </div>
      </div>
    </section>
  </div>;
}
