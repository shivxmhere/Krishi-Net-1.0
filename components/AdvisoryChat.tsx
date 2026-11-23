import React, { useState } from 'react';
import { Bot, Send, Trash2, Loader2, ShieldAlert, Sparkles } from 'lucide-react';
import { getAdvisoryResponse } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

type Message = { role: 'user' | 'model'; text: string };
const examples = [
  'How can I check whether my tomato plants have blight?',
  'What should I record before planting a new crop?',
  'How do I verify today\'s mandi prices?',
  'What signs suggest my crops need irrigation?'
];

export default function AdvisoryChat() {
  const { language } = useLanguage();
  const [history, setHistory] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function send(message = query) {
    const text = message.trim();
    if (!text || busy) return;
    setError('');
    setBusy(true);
    setQuery('');
    const previous = history;
    setHistory(prev => [...prev, { role: 'user', text }]);
    try {
      const answer = await getAdvisoryResponse(text, previous, 'General agriculture. Be explicit when advice needs expert validation.', language);
      setHistory(prev => [...prev, { role: 'model', text: answer }]);
    } catch (err: any) {
      setError(err?.message || 'The advisory service is unavailable. Try again.');
      setQuery(text);
    } finally {
      setBusy(false);
    }
  }

  return <div className="max-w-5xl mx-auto space-y-5">
    <header className="flex flex-wrap justify-between gap-4 items-start">
      <div><h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3"><Bot className="text-emerald-600"/> Krishi AI Advisory</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Ask a question and get an AI-generated explanation in your chosen language.</p></div>
      <button type="button" onClick={() => { setHistory([]); setQuery(''); setError(''); }}
        disabled={!history.length && !query} className="flex items-center gap-2 text-sm font-bold bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 disabled:opacity-50 hover:border-emerald-500">
        <Trash2 size={16}/> Clear chat
      </button>
    </header>
    <div className="flex gap-3 items-start p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
      <ShieldAlert size={20} className="shrink-0 mt-0.5"/>
      <p className="text-sm">This assistant may make mistakes. Responses are not verified field diagnoses, live mandi prices, or pesticide prescriptions. Check official sources and consult a qualified agronomist before high-impact actions.</p>
    </div>
    <div className="rounded-2xl border bg-white dark:bg-gray-800 dark:border-gray-700 min-h-[360px] p-5 md:p-7 space-y-4" aria-live="polite">
      {!history.length && <div className="py-10 text-center">
        <Sparkles className="text-emerald-500 mx-auto mb-3" size={34}/>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">What would you like to learn?</h2>
        <p className="text-gray-500 mt-2">Choose a question below or write your own.</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-8">{examples.map(s => <button key={s} disabled={busy} onClick={() => send(s)}
          className="p-4 text-left rounded-xl border hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">{s}</button>)}</div>
      </div>}
      {history.map((message, i) => <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[90%] md:max-w-[75%] rounded-2xl px-5 py-4 text-sm leading-6 whitespace-pre-wrap ${message.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'}`}>
          {message.text}
        </div>
      </div>)}
      {busy && <p className="flex items-center gap-2 text-gray-500"><Loader2 size={18} className="animate-spin"/> Generating a response...</p>}
    </div>
    {error && <p role="alert" className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">{error}</p>}
    <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-3 bg-white dark:bg-gray-800 p-3 border rounded-2xl">
      <label className="sr-only" htmlFor="krishi-ai-question">Your question</label>
      <input id="krishi-ai-question" value={query} onChange={e=>setQuery(e.target.value)} maxLength={2000}
        placeholder="Ask Krishi AI..." className="min-w-0 flex-1 rounded-xl px-3 py-3 dark:bg-gray-800 dark:text-white focus:outline-emerald-500"/>
      <button type="submit" disabled={!query.trim() || busy}
        className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50">
        <Send size={18}/> Send
      </button>
    </form>
  </div>;
}
