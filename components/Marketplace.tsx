import React, { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, ShoppingBasket, Trash2, RefreshCw, Send, Inbox } from 'lucide-react';
import { ecosystemRequest } from '../services/ecosystemApi';
import { getCurrentUser } from '../services/authService';

type Listing = { id: string; seller_id: string; seller: string; crop: string; quantity_kg: number; asking_price_per_kg: number; location: string; description: string; created_at: string };
type Inquiry = { id: string; crop: string; buyer: string; message: string; created_at: string };

export default function Marketplace() {
  const me = getCurrentUser()?.id;
  const [listings, setListings] = useState<Listing[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [search, setSearch] = useState('');
  const [crop, setCrop] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const visible = useMemo(() => listings.filter(item => `${item.crop} ${item.location} ${item.seller}`.toLowerCase().includes(search.toLowerCase())), [listings,search]);

  async function reload() {
    setNotice('');
    try {
      const [items, messages] = await Promise.all([
        ecosystemRequest<Listing[]>('/marketplace/listings'),
        ecosystemRequest<Inquiry[]>('/marketplace/my-inquiries')
      ]);
      setListings(items); setInquiries(messages);
    } catch(err: any) { setNotice(err.message || 'Unable to load marketplace'); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ reload(); },[]);

  async function publish(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setNotice('');
    try {
      await ecosystemRequest<Listing>('/marketplace/listings',{
        method:'POST',body:JSON.stringify({
          crop: crop.trim(), location: location.trim(), description: description.trim(),
          quantity_kg:Number(quantity), asking_price_per_kg:Number(price)
        })
      });
      setCrop(''); setLocation(''); setQuantity(''); setPrice(''); setDescription('');
      await reload(); setNotice('Your produce listing is now visible to signed-in members.');
    } catch(err: any) { setNotice(err.message); }
    finally { setBusy(false); }
  }
  async function close(id: string) {
    if (!window.confirm('Close this listing? It will no longer be visible to buyers.')) return;
    setBusy(true); setNotice('');
    try {
      await ecosystemRequest<void>(`/marketplace/listings/${id}`,{method:'DELETE'});
      await reload(); setNotice('Listing closed.');
    } catch(err: any) { setNotice(err.message); }
    finally { setBusy(false); }
  }
  async function enquire(e: React.FormEvent) {
    e.preventDefault(); if (!selected) return;
    setBusy(true); setNotice('');
    try {
      await ecosystemRequest(`/marketplace/listings/${selected}/inquiries`,{method:'POST',body:JSON.stringify({message:message.trim()})});
      setMessage(''); setSelected(null); setNotice('Your enquiry has been recorded for the seller. Buyer/seller messaging and notifications are not available yet.');
    } catch(err: any) { setNotice(err.message); }
    finally { setBusy(false); }
  }

  return <div className="max-w-6xl mx-auto space-y-6">
    <header className="flex flex-wrap justify-between items-start gap-4">
      <div><h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Produce Marketplace</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Post produce listings, discover sellers and send enquiries.</p></div>
      <button onClick={reload} className="flex items-center gap-2 rounded-xl border bg-white dark:bg-gray-800 px-4 py-2 hover:border-emerald-500"><RefreshCw size={16}/> Refresh</button>
    </header>
    <p className="rounded-xl p-4 bg-amber-50 border border-amber-200 text-amber-900 text-sm">
      Early beta. Prices are <strong>seller-entered asking prices</strong>, not verified mandi rates. No payment, delivery, identity verification or buyer protection is provided through Krishi-Net yet. Do not share sensitive financial details.
    </p>
    {notice && <p role="status" className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">{notice}</p>}
    <div className="grid lg:grid-cols-5 gap-6">
      <form onSubmit={publish} className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 p-6 space-y-4 h-fit">
        <h2 className="text-xl font-bold flex gap-2 items-center"><ShoppingBasket size={20}/> List produce</h2>
        <label className="block text-sm font-semibold">Crop
          <input required minLength={2} maxLength={100} value={crop} onChange={e=>setCrop(e.target.value)} placeholder="e.g. Tomato" className="block w-full mt-2 border rounded-xl p-3 dark:bg-gray-900 dark:border-gray-600"/>
        </label>
        <label className="block text-sm font-semibold">Location
          <input required minLength={2} maxLength={150} value={location} onChange={e=>setLocation(e.target.value)} placeholder="District, State" className="block w-full mt-2 border rounded-xl p-3 dark:bg-gray-900 dark:border-gray-600"/>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold">Quantity (kg)
            <input type="number" required min="0.01" max="10000000" step="any" value={quantity} onChange={e=>setQuantity(e.target.value)} className="block w-full mt-2 border rounded-xl p-3 dark:bg-gray-900 dark:border-gray-600"/>
          </label>
          <label className="block text-sm font-semibold">Asking price (₹/kg)
            <input type="number" required min="0" max="1000000" step="any" value={price} onChange={e=>setPrice(e.target.value)} className="block w-full mt-2 border rounded-xl p-3 dark:bg-gray-900 dark:border-gray-600"/>
          </label>
        </div>
        <label className="block text-sm font-semibold">Description (optional)
          <textarea rows={3} maxLength={2000} value={description} onChange={e=>setDescription(e.target.value)}
            placeholder="Quality, variety, harvest window..." className="block w-full mt-2 border rounded-xl p-3 dark:bg-gray-900 dark:border-gray-600"/>
        </label>
        <button disabled={busy} type="submit" className="w-full bg-emerald-600 text-white font-bold rounded-xl py-3 disabled:opacity-50 hover:bg-emerald-700">Publish listing</button>
      </form>
      <section className="lg:col-span-3 space-y-4">
        <label className="relative block">
          <Search className="absolute top-3.5 left-3 text-gray-400" size={18}/>
          <span className="sr-only">Search produce</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search crop, location or seller" className="w-full border rounded-xl pl-10 pr-4 py-3 dark:bg-gray-800 dark:border-gray-700"/>
        </label>
        {loading && <p>Loading listings...</p>}
        {!loading && visible.length===0 && <p className="p-5 rounded-xl bg-white dark:bg-gray-800 text-gray-500">No matching produce listings yet.</p>}
        {visible.map(item=><article key={item.id} className="border rounded-2xl bg-white dark:bg-gray-800 dark:border-gray-700 p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div><h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.crop}</h3>
              <p className="text-sm text-gray-500 flex gap-1 items-center mt-1"><MapPin size={15}/>{item.location} · {item.seller}</p></div>
            {item.seller_id===me && <button aria-label={`Close ${item.crop} listing`} onClick={()=>close(item.id)} disabled={busy} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>}
          </div>
          <div className="flex gap-5 flex-wrap text-sm"><span><strong>{item.quantity_kg.toLocaleString('en-IN')} kg</strong> available</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">₹{item.asking_price_per_kg.toLocaleString('en-IN')}/kg asking</span></div>
          {item.description && <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{item.description}</p>}
          {item.seller_id !== me && <button onClick={()=>setSelected(selected===item.id?null:item.id)} className="inline-flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300 text-sm"><Send size={16}/> {selected===item.id?'Cancel enquiry':'Contact via enquiry'}</button>}
          {selected===item.id && <form onSubmit={enquire} className="space-y-2 border-t dark:border-gray-700 pt-4">
            <label className="block text-sm font-semibold">Message to seller
              <textarea required minLength={5} maxLength={1000} rows={3} value={message} onChange={e=>setMessage(e.target.value)}
                placeholder="Describe quantity and delivery preferences. Avoid private payment details." className="mt-2 w-full border rounded-xl p-3 dark:bg-gray-900 dark:border-gray-600"/>
            </label>
            <button type="submit" disabled={busy} className="rounded-xl bg-emerald-600 text-white px-5 py-3 font-bold disabled:opacity-50">Send enquiry</button>
          </form>}
        </article>)}
        <div className="border rounded-2xl bg-white dark:bg-gray-800 dark:border-gray-700 p-5 space-y-3">
          <h2 className="font-bold text-lg flex items-center gap-2"><Inbox size={20}/> Enquiries received ({inquiries.length})</h2>
          {inquiries.length===0 && <p className="text-sm text-gray-500">No buyer enquiries received yet.</p>}
          {inquiries.map(inquiry=><div key={inquiry.id} className="border-t dark:border-gray-700 pt-3">
            <p className="text-sm font-bold">{inquiry.crop} · {inquiry.buyer}</p>
            <p className="text-sm whitespace-pre-wrap mt-1 text-gray-600 dark:text-gray-300">{inquiry.message}</p>
          </div>)}
        </div>
      </section>
    </div>
  </div>;
}
