import React, { useState, useRef } from 'react';
import { Camera, X, AlertCircle, CheckCircle, ChevronRight, Droplets, ShieldCheck, Sprout, ScanLine, Loader2, Leaf } from 'lucide-react';
import { analyzePlantImage } from '../services/geminiService';
import { saveScan } from '../services/historyService';
import { getCurrentUser } from '../services/authService';
import { DiseaseAnalysis, SUPPORTED_CROPS } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Icons } from './ui/IconSystem';
import { Button } from './ui/Button';

const DiseaseDetector: React.FC = () => {
  const { language } = useLanguage();
  const user = getCurrentUser();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DiseaseAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>('Other');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (navigator.vibrate) navigator.vibrate(10);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        analyzeImage(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageFile: File, base64Preview: string) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzePlantImage(imageFile, selectedCrop, language);
      setAnalysis(result);
      saveScan(selectedCrop, base64Preview, result, user?.location || 'Unknown');
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    } catch (err: any) {
      setError(err.message || "Failed to analyze image. Keep the subject clear.");
      if (navigator.vibrate) navigator.vibrate(50);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const ScanningOverlay = () => (
    <div className="absolute inset-0 z-20 overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-harvest-green/20 mix-blend-overlay backdrop-blur-[2px]" />

      {/* Scanning Beam */}
      <motion.div
        className="absolute w-full h-1 bg-gradient-to-r from-transparent via-sprout-green to-transparent shadow-[0_0_20px_#4ade80]"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />

      {/* Grid Overlay */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-30">
        {[...Array(36)].map((_, i) => (
          <div key={i} className="border-[0.5px] border-sprout-green/30" />
        ))}
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <div className="bg-deep-earth/80 backdrop-blur-md px-6 py-2 rounded-full border border-sprout-green/30 flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-sprout-green animate-spin" />
          <span className="text-mist-white font-mono text-xs tracking-widest">ANALYZING BIOMETRICS...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-deep-earth dark:text-white flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-harvest-green to-leaf-green rounded-2xl flex items-center justify-center text-white shadow-glow-green">
              <Icons.Disease size={28} />
            </div>
            Smart Diagnosis
          </h2>
          <p className="text-earth-soil dark:text-gray-400 mt-1 ml-16 font-medium">AI-Powered Disease Detection</p>
        </div>
        {image && (
          <Button variant="ghost" onClick={reset} className="rounded-full p-2 h-auto hover:bg-red-50 hover:text-red-500">
            <X size={24} />
          </Button>
        )}
      </motion.div>

      {!image ? (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          {/* Crop Selector */}
          <GlassCard className="p-6">
            <h3 className="text-xs font-bold text-earth-soil/70 dark:text-gray-400 uppercase tracking-widest mb-4">Select Crop Context</h3>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_CROPS.map(crop => (
                <button
                  key={crop}
                  onClick={() => setSelectedCrop(crop)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedCrop === crop
                    ? 'bg-harvest-green text-white border-harvest-green shadow-lg shadow-harvest-green/20'
                    : 'bg-white/50 dark:bg-white/5 text-earth-soil dark:text-gray-300 border-glass-border hover:border-sprout-green/50'
                    }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Upload Area */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => fileInputRef.current?.click()}>
            <GlassCard className="group cursor-pointer p-12 text-center border-2 border-dashed border-glass-border hover:border-sprout-green relative overflow-hidden transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-sprout-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

              <div className="w-20 h-20 mx-auto bg-sprout-green/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-sprout-green/20 transition-all">
                <Camera className="w-8 h-8 text-harvest-green dark:text-sprout-green" />
              </div>
              <h3 className="text-2xl font-display font-bold text-deep-earth dark:text-white mb-2">Capture or Upload</h3>
              <p className="text-earth-soil dark:text-gray-400">Take a clear photo of the {selectedCrop} leaf.</p>
            </GlassCard>
          </motion.div>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Preview */}
          <GlassCard className="p-2 relative aspect-square">
            <div className="w-full h-full rounded-xl overflow-hidden relative">
              <img src={image} alt="Crop" className="w-full h-full object-cover" />
              {loading && <ScanningOverlay />}
            </div>
          </GlassCard>

          {/* Results */}
          <div className="space-y-6">
            {error && (
              <GlassCard className="p-4 border-red-200 bg-red-50/50 flex items-center gap-3 text-red-700">
                <AlertCircle size={20} />
                <span className="font-bold">{error}</span>
              </GlassCard>
            )}

            <AnimatePresence mode="wait">
              {analysis && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                  {/* Diagnosis Header */}
                  <GlassCard className={`p-6 border-l-4 ${analysis.severity === 'High' ? 'border-l-red-500 bg-red-50/20' :
                      analysis.severity === 'Medium' ? 'border-l-orange-500 bg-orange-50/20' :
                        'border-l-green-500 bg-green-50/20'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${analysis.severity === 'High' ? 'bg-red-100 text-red-800' :
                          analysis.severity === 'Medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {analysis.severity} Risk
                      </span>
                      <span className="text-earth-soil/60 text-xs font-bold">{(analysis.confidence * 100).toFixed(0)}% Confidence</span>
                    </div>
                    <h3 className="text-3xl font-display font-bold text-deep-earth dark:text-white mb-2">{analysis.diseaseName}</h3>
                    <p className="text-earth-soil dark:text-gray-300 leading-relaxed font-medium">{analysis.description}</p>
                  </GlassCard>

                  {/* Actions Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <GlassCard className="p-5 bg-blue-50/30 border-blue-100/50">
                      <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <AlertCircle size={18} /> Next Steps
                      </h4>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{analysis.nextSteps}</p>
                    </GlassCard>

                    <GlassCard className="p-5 bg-purple-50/30 border-purple-100/50">
                      <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                        <Droplets size={18} /> Treatment
                      </h4>
                      <ul className="space-y-2">
                        {analysis.treatment.map((t, i) => (
                          <li key={i} className="text-sm font-medium text-purple-800 dark:text-purple-200 flex gap-2">
                            <span className="w-1.5 h-1.5 mt-1.5 bg-purple-400 rounded-full shrink-0" />{t}
                          </li>
                        ))}
                      </ul>
                    </GlassCard>
                  </div>

                  {/* Recommended Products */}
                  {analysis.products && analysis.products.length > 0 && (
                    <GlassCard className="p-6">
                      <h4 className="font-bold text-deep-earth dark:text-white mb-4 flex items-center gap-2">
                        <Sprout size={20} className="text-harvest-green" /> Recommended Products
                      </h4>
                      <div className="space-y-3">
                        {analysis.products.map((product, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-glass-border hover:border-sprout-green/50 transition-colors">
                            <div>
                              <p className="font-bold text-deep-earth dark:text-white">{product.name}</p>
                              <p className="text-xs text-earth-soil dark:text-gray-400">{product.price}</p>
                            </div>
                            <a href={product.buyLink} target="_blank" rel="noreferrer" className="p-2 bg-harvest-green text-white rounded-lg hover:bg-leaf-green">
                              <ChevronRight size={16} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-sprout-green/10 text-harvest-green dark:text-sprout-green rounded-full text-xs font-bold border border-sprout-green/20">
                      <CheckCircle size={14} /> Scan Saved to History
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetector;