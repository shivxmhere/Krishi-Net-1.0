import React, { useEffect, useState } from 'react';
import { MessageCircle, Send, Trash2, Plus, RefreshCw } from 'lucide-react';
import { ecosystemRequest } from '../services/ecosystemApi';
import { getCurrentUser } from '../services/authService';

type Post = { id: string; title: string; body: string; category: string; author: string; author_id: string; created_at: string };
type Comment = { id: string; author: string; body: string; created_at: string };
const categories = ['General', 'Crop Health', 'Market', 'Weather', 'Learning'];

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');
  const [selected, setSelected] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const myId = getCurrentUser()?.id;

  async function reload() {
    setError('');
    try { setPosts(await ecosystemRequest<Post[]>('/community/posts')); }
    catch (err: any) { setError(err.message || 'Could not load discussions'); }
    finally { setLoading(false); }
  }
  useEffect(() => { reload(); }, []);

  async function openPost(id: string) {
    if (selected === id) { setSelected(null); setComments([]); return; }
    setSelected(id); setError('');
    try { setComments(await ecosystemRequest<Comment[]>(`/community/posts/${id}/comments`)); }
    catch (err: any) { setError(err.message); }
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      await ecosystemRequest<Post>('/community/posts', { method: 'POST', body: JSON.stringify({ title: title.trim(), body: body.trim(), category }) });
      setTitle(''); setBody(''); setCategory('General'); await reload();
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function createReply(e: React.FormEvent) {
    e.preventDefault(); if (!selected) return; setBusy(true); setError('');
    try {
      const comment = await ecosystemRequest<Comment>(`/community/posts/${selected}/comments`, { method: 'POST', body: JSON.stringify({ body: reply.trim() }) });
      setComments(prev => [...prev, comment]); setReply('');
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function removePost(id: string) {
    if (!window.confirm('Delete this discussion and its replies?')) return;
    setBusy(true); setError('');
    try {
      await ecosystemRequest<void>(`/community/posts/${id}`, { method: 'DELETE' });
      if (selected === id) { setSelected(null); setComments([]); }
      await reload();
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <div className="max-w-6xl mx-auto space-y-6">
    <header className="flex justify-between flex-wrap gap-4 items-center">
      <div><h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Krishi Community</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Share experiences, ask questions and learn from other members.</p></div>
      <button onClick={reload} className="flex gap-2 items-center px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border hover:border-emerald-500"><RefreshCw size={16}/> Refresh</button>
    </header>
    <p className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-sm">
      Community posts are written by users and are not verified agricultural advice. Do not share private contact details; report harmful content to the platform administrator. Moderation tooling is still under development.
    </p>
    {error && <div role="alert" className="p-4 bg-red-50 rounded-xl text-red-700">{error}</div>}
    <div className="grid lg:grid-cols-5 gap-6">
      <form onSubmit={createPost} className="lg:col-span-2 h-fit rounded-2xl bg-white dark:bg-gray-800 dark:border-gray-700 border p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Plus size={20}/> New discussion</h2>
        <label className="block text-sm font-semibold">Title
          <input required minLength={5} maxLength={140} value={title} onChange={e=>setTitle(e.target.value)}
            className="w-full mt-2 p-3 border rounded-xl dark:bg-gray-900 dark:border-gray-600" placeholder="What do you want to ask?"/>
        </label>
        <label className="block text-sm font-semibold">Category
          <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full mt-2 p-3 border rounded-xl dark:bg-gray-900 dark:border-gray-600">
            {categories.map(x=><option key={x}>{x}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">Details
          <textarea required minLength={10} maxLength={4000} rows={5} value={body} onChange={e=>setBody(e.target.value)}
            className="w-full mt-2 p-3 border rounded-xl dark:bg-gray-900 dark:border-gray-600" placeholder="Describe your question or experience."/>
        </label>
        <button disabled={busy} type="submit" className="w-full rounded-xl bg-emerald-600 text-white font-bold py-3 disabled:opacity-50 hover:bg-emerald-700">Publish discussion</button>
      </form>
      <section className="lg:col-span-3 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent discussions</h2>
        {loading && <p>Loading discussions...</p>}
        {!loading && posts.length===0 && <p className="text-gray-500 bg-white dark:bg-gray-800 rounded-xl p-5">No discussions yet. Start the conversation!</p>}
        {posts.map(post=><article key={post.id} className="rounded-2xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-5 space-y-3">
          <div className="flex justify-between gap-3">
            <div><span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">{post.category}</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{post.title}</h3>
              <p className="text-xs text-gray-500 mt-1">By {post.author} · {new Date(post.created_at).toLocaleDateString()}</p></div>
            {post.author_id===myId && <button disabled={busy} aria-label="Delete discussion" onClick={()=>removePost(post.id)} className="self-start p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>}
          </div>
          <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-200">{post.body}</p>
          <button onClick={()=>openPost(post.id)} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm"><MessageCircle size={17}/>{selected === post.id ? 'Hide replies' : 'Open replies'}</button>
          {selected===post.id && <div className="pt-3 border-t dark:border-gray-700 space-y-3">
            {comments.length===0 && <p className="text-sm text-gray-500">No replies yet.</p>}
            {comments.map(comment=><div key={comment.id} className="rounded-xl bg-gray-50 dark:bg-gray-900 p-3 text-sm">
              <p className="font-bold text-emerald-700 dark:text-emerald-300">{comment.author}</p>
              <p className="mt-1 whitespace-pre-wrap">{comment.body}</p></div>)}
            <form onSubmit={createReply} className="flex gap-2">
              <label className="sr-only" htmlFor={`reply-${post.id}`}>Write a reply</label>
              <input id={`reply-${post.id}`} required minLength={2} maxLength={2000} value={reply} onChange={e=>setReply(e.target.value)}
                className="min-w-0 flex-1 border rounded-xl p-2 dark:bg-gray-900 dark:border-gray-600" placeholder="Write a reply"/>
              <button type="submit" disabled={busy} aria-label="Send reply" className="p-3 rounded-xl bg-emerald-600 text-white disabled:opacity-50"><Send size={18}/></button>
            </form>
          </div>}
        </article>)}
      </section>
    </div>
  </div>;
}
