
import React, { useEffect, useState } from 'react';
import { getScanHistory, deleteScan, getStats } from '../services/historyService';
import { ScanRecord } from '../types';
import { Calendar, Trash2, MapPin, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const History: React.FC = () => {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, healthy: 0, issues: 0 });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setHistory(getScanHistory());
    setStats(getStats());
  };

  const handleDelete = (id: string) => {
    if(confirm('Are you sure you want to delete this scan record?')) {
      deleteScan(id);
      loadData();
    }
  };

  const filteredHistory = history.filter(h => 
    h.crop.toLowerCase().includes(filter.toLowerCase()) || 
    h.analysis.diseaseName.toLowerCase().includes(filter.toLowerCase())
  );

  const getSeverityBadge = (severity: string) => {
    switch(severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-black dark:text-white">Farm History</h2>
          <p className="text-gray-500 font-medium">Track your crop health timeline</p>
        </div>
        
        {/* Stats Cards */}
        <div className="flex gap-4">
           <div className="bg-white p-3 rounded-xl border-2 border-agri-green-100 shadow-sm text-center min-w-[100px]">
             <p className="text-xs font-bold text-gray-500 uppercase">Total Scans</p>
             <p className="text-2xl font-black text-black">{stats.total}</p>
           </div>
           <div className="bg-white p-3 rounded-xl border-2 border-red-100 shadow-sm text-center min-w-[100px]">
             <p className="text-xs font-bold text-gray-500 uppercase">Issues</p>
             <p className="text-2xl font-black text-red-600">{stats.issues}</p>
           </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search crops or diseases..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black outline-none font-medium bg-white"
        />
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((scan) => (
              <motion.div 
                key={scan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image Section */}
                  <div className="w-full md:w-48 h-48 md:h-auto relative shrink-0">
                    <img src={scan.image} alt="Scan" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-white text-xs font-bold">
                      {new Date(scan.date).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-black text-gray-400 uppercase tracking-wide">{scan.crop}</span>
                          <h3 className="text-xl font-black text-black">{scan.analysis.diseaseName}</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityBadge(scan.analysis.severity)}`}>
                          {scan.analysis.severity}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4 font-medium">
                        {scan.analysis.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500">
                         <div className="flex items-center gap-1">
                           <MapPin className="w-3 h-3" />
                           {scan.location}
                         </div>
                         <div className="flex items-center gap-1">
                           <CheckCircle className="w-3 h-3 text-agri-green-500" />
                           Confidence: {(scan.analysis.confidence * 100).toFixed(0)}%
                         </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                      <button 
                        onClick={() => handleDelete(scan.id)}
                        className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-bold text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Record
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
               <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
               <p className="text-gray-500 font-medium">No history records found.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default History;
