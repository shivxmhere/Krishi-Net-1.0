import React from 'react';
import { AppView } from '../types';
import { getCurrentUser } from '../services/authService';
import { Activity, Camera, CloudSun, Sprout, MessageCircle, BarChart3, BookOpen, Settings, ArrowRight } from 'lucide-react';

interface DashboardProps { setView: (view: AppView) => void; }

const actions = [
  { name: 'Scan a crop', description: 'Upload a plant photo to get an AI-assisted assessment.', view: AppView.DISEASE_DETECTION, Icon: Camera },
  { name: 'Ask Krishi AI', description: 'Ask questions about crops and agricultural practices.', view: AppView.ADVISORY, Icon: MessageCircle },
  { name: 'Explore markets', description: 'Find market resources and manage your price watchlist.', view: AppView.MARKET, Icon: BarChart3 },
  { name: 'Manage my farm', description: 'Add crops and track planting information.', view: AppView.FARM_MANAGEMENT, Icon: Sprout },
  { name: 'Scan history', description: 'Review assessments previously saved on this device.', view: AppView.HISTORY, Icon: BookOpen },
  { name: 'My settings', description: 'Update your profile and language preferences.', view: AppView.SETTINGS, Icon: Settings },
];

export default function Dashboard({ setView }: DashboardProps) {
  const user = getCurrentUser();
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-700 to-teal-600 p-8 md:p-12 text-white">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold"><Activity size={14}/> Krishi-Net workspace</span>
          <h1 className="mt-6 text-3xl md:text-5xl font-extrabold">Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 🌾</h1>
          <p className="mt-4 text-emerald-50 text-lg">Everything you need to care for your crops, discover information and make better-informed decisions.</p>
          <button onClick={() => setView(AppView.FARM_MANAGEMENT)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-emerald-800 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300">
            Open my farm <ArrowRight size={18} />
          </button>
        </div>
        <Sprout className="absolute right-10 -bottom-12 h-64 w-64 text-white/10" aria-hidden="true" />
      </section>

      <section>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Quick actions</h2>
        <p className="text-sm text-gray-500 mt-1">Select a tool to get started.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map(({ name, description, view, Icon }) => (
            <button key={name} onClick={() => setView(view)}
              className="group text-left rounded-2xl border border-emerald-100 bg-white dark:bg-gray-800 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg hover:border-emerald-400 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500">
              <span className="inline-flex p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200"><Icon size={25}/></span>
              <div className="mt-5 flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h3>
                <ArrowRight size={18} className="text-emerald-600 group-hover:translate-x-1 transition-transform"/>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-300 leading-6">{description}</p>
            </button>
          ))}
        </div>
      </section>
      <aside className="flex gap-3 items-start rounded-xl bg-blue-50 text-blue-900 p-4 border border-blue-100">
        <CloudSun className="shrink-0 mt-0.5" size={20}/>
        <p className="text-sm">Weather, mandi prices and AI outputs require verified live sources. Krishi-Net does not present example prices, crop-loss figures or estimated savings as real observations.</p>
      </aside>
    </div>
  );
}
