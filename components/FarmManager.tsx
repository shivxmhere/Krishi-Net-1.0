import React, { useState } from 'react';
import { Plus, Calendar, Sprout, Tractor, Trash2 } from 'lucide-react';
import { Crop } from '../types';
import { INITIAL_CROPS } from '../constants';

const FarmManager: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>(INITIAL_CROPS);
  const [isAdding, setIsAdding] = useState(false);
  const [newCrop, setNewCrop] = useState<Partial<Crop>>({});

  const handleAdd = () => {
    if (newCrop.name && newCrop.area) {
      const crop: Crop = {
        id: Date.now().toString(),
        name: newCrop.name,
        variety: newCrop.variety || 'Unknown',
        plantingDate: newCrop.plantingDate || new Date().toISOString().split('T')[0],
        area: Number(newCrop.area),
        expectedHarvestDate: newCrop.expectedHarvestDate || '',
        status: 'Healthy'
      };
      setCrops([...crops, crop]);
      setIsAdding(false);
      setNewCrop({});
    }
  };

  const handleDelete = (id: string) => {
    setCrops(crops.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Farm</h2>
          <p className="text-gray-500">Manage your crops and field activities</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Crop
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 animate-fade-in">
          <h3 className="font-semibold text-gray-800 mb-4">New Crop Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Crop Name (e.g., Wheat)"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              onChange={e => setNewCrop({...newCrop, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="Variety"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              onChange={e => setNewCrop({...newCrop, variety: e.target.value})}
            />
            <input
              type="number"
              placeholder="Area (Acres)"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              onChange={e => setNewCrop({...newCrop, area: Number(e.target.value)})}
            />
             <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Planting Date</label>
              <input
                type="date"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                onChange={e => setNewCrop({...newCrop, plantingDate: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleAdd} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Save Crop</button>
            <button onClick={() => setIsAdding(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crops.map(crop => (
          <div key={crop.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative group">
            <button 
              onClick={() => handleDelete(crop.id)}
              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <Sprout className="w-7 h-7" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                crop.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {crop.status}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800">{crop.name}</h3>
            <p className="text-gray-500 text-sm mb-4">{crop.variety}</p>
            
            <div className="space-y-3 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Tractor className="w-4 h-4 text-gray-400" />
                <span>{crop.area} Acres</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Planted: {crop.plantingDate}</span>
              </div>
            </div>
          </div>
        ))}

        {crops.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
            <Sprout className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No crops added yet. Start by adding a crop.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmManager;