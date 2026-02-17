import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Trash2, ArrowRight, Loader2, Sprout, Tractor } from 'lucide-react';
import { Crop } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Icons } from './ui/IconSystem';
import { Button } from './ui/Button';

const FarmManager: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCrop, setNewCrop] = useState<Partial<Crop>>({});
  const [error, setError] = useState('');

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => { fetchCrops(); }, []);

  const fetchCrops = async () => {
    try {
      const token = localStorage.getItem('krishi_net_token');
      if (!token) return;
      const response = await fetch(`${API_URL}/api/v1/crops/`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        const mappedCrops = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          variety: c.variety,
          plantingDate: c.planting_date,
          area: c.area,
          expectedHarvestDate: c.expected_harvest_date,
          status: c.status
        }));
        setCrops(mappedCrops);
      }
    } catch (err) { console.error("Failed to fetch crops", err); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (newCrop.name && newCrop.area) {
      try {
        const token = localStorage.getItem('krishi_net_token');
        const payload = {
          name: newCrop.name,
          variety: newCrop.variety || 'Unknown',
          planting_date: newCrop.plantingDate || new Date().toISOString().split('T')[0],
          area: Number(newCrop.area),
          expected_harvest_date: newCrop.expectedHarvestDate || null
        };
        const response = await fetch(`${API_URL}/api/v1/crops/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          await fetchCrops();
          setIsAdding(false);
          setNewCrop({});
        } else { setError("Failed to save crop"); }
      } catch (err) { setError("Network error saving crop"); }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this crop?')) {
      try {
        const token = localStorage.getItem('krishi_net_token');
        await fetch(`${API_URL}/api/v1/crops/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        setCrops(crops.filter(c => c.id !== id));
      } catch (err) { console.error("Failed to delete", err); }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 min-h-[80vh] p-4">
      <GlassCard className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-harvest-green to-leaf-green rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-900/20">
            <Icons.Farm size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold text-deep-earth dark:text-white">My Farm</h2>
            <p className="text-earth-soil dark:text-gray-400 font-medium">Manage your {crops.length} active crops.</p>
          </div>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="rounded-full shadow-lg shadow-sprout-green/30">
            <Plus size={20} className="mr-2" /> Add Crop
          </Button>
        )}
      </GlassCard>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard className="p-8 border-2 border-sprout-green/50">
              <h3 className="font-bold text-xl text-deep-earth dark:text-white mb-6">New Crop Details</h3>
              {error && <p className="text-red-500 mb-4 font-bold bg-red-50 p-3 rounded-lg">{error}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Crop Name", field: "name", type: "text", placeholder: "e.g. Wheat" },
                  { label: "Variety", field: "variety", type: "text", placeholder: "e.g. HD-2967" },
                  { label: "Area (Acres)", field: "area", type: "number", placeholder: "0.0" },
                  { label: "Planting Date", field: "plantingDate", type: "date", placeholder: "" }
                ].map((input, i) => (
                  <div key={i} className="space-y-2">
                    <label className="text-sm font-bold text-earth-soil dark:text-gray-400">{input.label}</label>
                    <input
                      type={input.type}
                      placeholder={input.placeholder}
                      value={newCrop[input.field as keyof Crop] as string || ''}
                      onChange={e => setNewCrop({ ...newCrop, [input.field]: input.type === 'number' ? Number(e.target.value) : e.target.value })}
                      className="w-full p-4 bg-white/50 dark:bg-black/20 border border-glass-border rounded-xl font-bold outline-none focus:ring-2 focus:ring-sprout-green dark:text-white transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-8">
                <Button onClick={handleAdd} className="flex-1 py-4 text-lg">Save to Farm</Button>
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="px-8 py-4">Cancel</Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-harvest-green" /></div>
      ) : crops.length === 0 && !isAdding ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard className="flex flex-col items-center justify-center py-20 px-4 text-center border-dashed border-2 border-sprout-green/30">
            <div className="w-32 h-32 bg-sprout-green/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Icons.Farm size={64} className="text-harvest-green" />
            </div>
            <h3 className="text-2xl font-black text-deep-earth dark:text-white mb-2">No Crops Yet</h3>
            <p className="text-earth-soil dark:text-gray-400 font-medium max-w-sm mb-8">Start by adding your first crop to track health & market data.</p>
            <Button onClick={() => setIsAdding(true)} size="lg" className="rounded-full px-8">
              <Plus size={20} className="mr-2" /> Add Your First Crop
            </Button>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={crop.id}
            >
              <GlassCard className="p-6 hover:border-sprout-green hover:shadow-glow-green group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sprout-green/20 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />

                <button
                  onClick={() => handleDelete(crop.id)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all z-10"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-harvest-green to-leaf-green rounded-2xl flex items-center justify-center text-white shadow-md">
                    <Sprout size={28} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${crop.status === 'Healthy'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                    {crop.status}
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-display font-bold text-deep-earth dark:text-white truncate">{crop.name}</h3>
                  <p className="text-earth-soil dark:text-gray-400 text-sm mb-6 font-medium">{crop.variety}</p>

                  <div className="space-y-3 pt-4 border-t border-glass-border">
                    <div className="flex items-center gap-3 text-sm font-bold text-deep-earth dark:text-gray-300">
                      <Tractor size={16} className="text-earth-amber" />
                      <span>{crop.area} Acres</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-deep-earth dark:text-gray-300">
                      <Calendar size={16} className="text-sky-morning" />
                      <span>Planted: {crop.plantingDate}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default FarmManager;
