import React, { useEffect, useState } from 'react';
import { getScanHistory, deleteScan, getStats } from '../services/historyService';
import { ScanRecord } from '../types';
import { Search, Trash2, MapPin, CheckCircle, Calendar, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Icons } from './ui/IconSystem';
import { Button } from './ui/Button';

const History: React.FC = () => {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, healthy: 0, issues: 0 });
  const [filter, setFilter] = useState('');
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setHistory(getScanHistory());
    setStats(getStats());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this record?')) {
      deleteScan(id);
      loadData();
      if (selectedScan?.id === id) setSelectedScan(null);
    }
  };

  const filteredHistory = history.filter(h =>
    h.crop.toLowerCase().includes(filter.toLowerCase()) ||
    h.analysis.diseaseName.toLowerCase().includes(filter.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20';
      case 'low': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-green-500 bg-green-100 dark:bg-green-900/20';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 min-h-[80vh] pb-24">
      {/* Header & Stats */}
      <GlassCard className="p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-harvest-green/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-harvest-green/20 transition-all" />
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-earth-soil to-earth-coffee rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Icons.History size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-deep-earth dark:text-white">Timeline</h2>
              <p className="text-earth-soil dark:text-gray-400 font-medium">Track your farm's health journey</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center px-4">
              <p className="text-xs font-bold text-earth-soil/60 uppercase tracking-widest">Scans</p>
              <p className="text-3xl font-black text-deep-earth dark:text-white">{stats.total}</p>
            </div>
            <div className="w-px bg-glass-border h-10 self-center" />
            <div className="text-center px-4">
              <p className="text-xs font-bold text-earth-soil/60 uppercase tracking-widest">Issues</p>
              <p className="text-3xl font-black text-red-500">{stats.issues}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search crops, diseases..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-black/20 backdrop-blur-md border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-harvest-green/50 text-deep-earth dark:text-white placeholder-earth-soil/50 transition-all shadow-sm"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((scan, i) => (
              <motion.div
                key={scan.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedScan(scan)}
              >
                <GlassCard className="p-0 overflow-hidden cursor-pointer hover:border-sprout-green hover:shadow-glow-green group h-full">
                  <div className="h-48 relative overflow-hidden">
                    <img src={scan.image} alt="Scan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <div>
                        <p className="text-white font-bold text-lg shadow-black drop-shadow-md">{scan.crop}</p>
                        <p className="text-white/80 text-xs flex items-center gap-1">
                          <Calendar size={10} /> {new Date(scan.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getSeverityColor(scan.analysis.severity)}`}>
                        {scan.analysis.severity}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 relative">
                    <h3 className="font-bold text-deep-earth dark:text-white text-lg mb-1 truncate">{scan.analysis.diseaseName}</h3>
                    <p className="text-xs text-earth-soil dark:text-gray-400 font-medium line-clamp-2 mb-3">{scan.analysis.description}</p>

                    <div className="flex justify-between items-center pt-3 border-t border-glass-border">
                      <span className="text-xs font-bold text-harvest-green dark:text-sprout-green flex items-center gap-1">
                        <CheckCircle size={12} /> {(scan.analysis.confidence * 100).toFixed(0)}% Match
                      </span>
                      <button onClick={(e) => handleDelete(scan.id, e)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center opacity-50">
              <Icons.History size={48} className="mx-auto mb-4 text-earth-soil" />
              <p>No history found matching your search.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedScan(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-deep-earth w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setSelectedScan(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 rounded-full text-white hover:bg-black/40 transition-colors">
                <X size={20} />
              </button>

              <div className="h-64 relative">
                <img src={selectedScan.image} alt="Detail" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-earth to-transparent opacity-90" />
                <div className="absolute bottom-6 left-6">
                  <h2 className="text-4xl font-display font-bold text-white mb-1">{selectedScan.analysis.diseaseName}</h2>
                  <div className="flex items-center gap-4 text-white/80 font-medium">
                    <span className="flex items-center gap-1"><Icons.Farm size={16} /> {selectedScan.crop}</span>
                    <span className="flex items-center gap-1"><MapPin size={16} /> {selectedScan.location}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${getSeverityColor(selectedScan.analysis.severity)}`}>
                      {selectedScan.analysis.severity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-deep-earth dark:text-white mb-2">Diagnosis</h3>
                  <p className="text-earth-soil dark:text-gray-300 leading-relaxed text-lg">{selectedScan.analysis.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-2xl">
                    <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-3">Treatment</h4>
                    <ul className="space-y-2">
                      {selectedScan.analysis.treatment.map((t, i) => (
                        <li key={i} className="text-sm font-medium text-purple-800 dark:text-purple-200 flex gap-2">
                          <span className="w-1.5 h-1.5 mt-1.5 bg-purple-500 rounded-full shrink-0" />{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl">
                    <h4 className="font-bold text-emerald-700 dark:text-emerald-300 mb-3">Prevention</h4>
                    <ul className="space-y-2">
                      {selectedScan.analysis.prevention.map((t, i) => (
                        <li key={i} className="text-sm font-medium text-emerald-800 dark:text-emerald-200 flex gap-2">
                          <span className="w-1.5 h-1.5 mt-1.5 bg-emerald-500 rounded-full shrink-0" />{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;
