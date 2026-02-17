
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Sprout, Tractor, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { Crop } from '../types';
import { motion } from 'framer-motion';
import { getCurrentUser } from '../services/authService';

const FarmManager: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCrop, setNewCrop] = useState<Partial<Crop>>({});
  const [error, setError] = useState('');

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const token = localStorage.getItem('krishi_net_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/v1/crops/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Map backend response (snake_case) to frontend type (camelCase) if needed
        // But our CropOut schema uses snake_case keys like planting_date
        // We need to map them to match our Crop interface
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
    } catch (err) {
      console.error("Failed to fetch crops", err);
    } finally {
      setLoading(false);
    }
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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          await fetchCrops(); // Refresh list
          setIsAdding(false);
          setNewCrop({});
        } else {
          setError("Failed to save crop");
        }
      } catch (err) {
        setError("Network error saving crop");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this crop?')) {
      try {
        const token = localStorage.getItem('krishi_net_token');
        await fetch(`${API_URL}/api/v1/crops/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCrops(crops.filter(c => c.id !== id));
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 min-h-[80vh] p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">My Farm</h2>
          <p className="text-gray-500 font-medium">Manage your crops and field activities</p>
        </div>
        {!loading && crops.length > 0 && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Crop
          </button>
        )}
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border-2 border-green-500"
        >
          <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-6">New Crop Details</h3>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500">Crop Name</label>
              <input
                type="text"
                placeholder="e.g. Wheat"
                value={newCrop.name || ''}
                className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                onChange={e => setNewCrop({ ...newCrop, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500">Variety</label>
              <input
                type="text"
                placeholder="e.g. HD-2967"
                value={newCrop.variety || ''}
                className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                onChange={e => setNewCrop({ ...newCrop, variety: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500">Area (Acres)</label>
              <input
                type="number"
                placeholder="0.0"
                value={newCrop.area || ''}
                className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                onChange={e => setNewCrop({ ...newCrop, area: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500">Planting Date</label>
              <input
                type="date"
                value={newCrop.plantingDate || ''}
                className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
                onChange={e => setNewCrop({ ...newCrop, plantingDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button onClick={handleAdd} className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors">Save To Cloud</button>
            <button onClick={() => setIsAdding(false)} className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : crops.length === 0 && !isAdding ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 px-4 text-center border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-[2.5rem] bg-white/50 dark:bg-gray-800/50"
        >
          <div className="w-32 h-32 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Sprout className="w-16 h-16 text-green-500" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No Crops Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mb-8">
            Start by adding your first crop to track its health, receive weather alerts, and get market insights.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-green-200 hover:scale-105 transition-transform flex items-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Add Your First Crop
          </button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map(crop => (
            <motion.div
              layout
              key={crop.id}
              className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl hover:border-green-400 transition-all relative group"
            >
              <button
                onClick={() => handleDelete(crop.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800">
                  <Sprout className="w-8 h-8" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${crop.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {crop.status}
                </span>
              </div>

              <h3 className="text-xl font-black text-gray-900 dark:text-white">{crop.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-medium">{crop.variety}</p>

              <div className="space-y-3 pt-4 border-t-2 border-gray-50 dark:border-gray-700">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
                  <Tractor className="w-4 h-4 text-gray-400" />
                  <span>{crop.area} Acres</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Planted: {crop.plantingDate}</span>
                </div>
                {/* 
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span>Harvest: {crop.expectedHarvestDate || 'Not set'}</span>
                </div>
                */}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmManager;
