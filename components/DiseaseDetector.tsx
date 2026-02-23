
import React, { useState, useRef } from 'react';
import { Camera, X, AlertCircle, CheckCircle, ChevronRight, Droplets, Info, ScanLine, Loader2, ImagePlus, User, Heart, Plus, MessageSquare } from 'lucide-react';
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
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto h-full">
      <div className="grid lg:grid-cols-12 gap-0 bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 min-h-[600px]">

        {/* Left Side: Live Feed / Image Area */}
        <div className="lg:col-span-7 relative bg-gray-900 overflow-hidden">
          {image ? (
            <img src={image} alt="Target" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1200&h=1200&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
          )}

          {/* Overlay Badges */}
          <div className="absolute top-6 left-6 flex items-center gap-3">
            <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Live Feed • 1080p</span>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="w-full h-full border-2 border-emerald-500 rounded-3xl relative">
              {/* Scan Corners */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl"></div>

              {/* Center Reticle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border border-emerald-500/50 rounded-lg flex items-center justify-center">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                </div>
              </div>

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px] rounded-3xl flex items-center justify-center overflow-hidden"
                >
                  <motion.div
                    className="absolute w-full h-1 bg-emerald-400 shadow-[0_0_20px_#4ade80]"
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-emerald-500/30 flex items-center gap-4 text-white">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                    <div>
                      <p className="text-[10px] font-black tracking-widest leading-none mb-1 text-emerald-400">ANALYZING PATTERNS...</p>
                      <p className="text-xs font-bold opacity-80">Hold steady. Align affected area.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6">
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-black/60 transition-all">
                <ImagePlus size={20} />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Upload</span>
            </button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => cameraInputRef.current?.click()}
              className="w-20 h-20 rounded-full bg-white p-1.5 shadow-2xl"
            >
              <div className="w-full h-full rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-600">
                <div className="w-14 h-14 bg-emerald-500 rounded-full animate-pulse opacity-20 absolute"></div>
                <Camera size={32} />
              </div>
            </motion.button>

            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-black/60 transition-all">
                <ScanLine size={20} />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Switch</span>
            </button>

            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileUpload} />
          </div>
        </div>

        {/* Right Side: Analysis Results */}
        <div className="lg:col-span-5 p-8 overflow-y-auto max-h-[85vh] no-scrollbar space-y-8 bg-white">
          <AnimatePresence mode="wait">
            {!analysis && !loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-center items-center text-center p-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mb-6">
                  <Icons.Disease size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Ready to Scan</h2>
                <p className="text-gray-500 font-medium text-sm px-8">Select your crop and point the camera at any visible symptoms for an instant AI diagnosis.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  {SUPPORTED_CROPS.map(crop => (
                    <button
                      key={crop}
                      onClick={() => setSelectedCrop(crop)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedCrop === crop ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'}`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : analysis ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-md">Analysis Complete</span>
                    <Icons.Bell size={14} className="text-gray-300" />
                  </div>
                  <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">{analysis.diseaseName}</h2>
                  <p className="italic text-gray-400 text-sm font-medium">{selectedCrop} Disease</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Severity Level</span>
                    <span className="text-red-500 italic">▲ Critical ({(analysis.confidence * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-3 bg-red-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.confidence * 100}%` }}
                      className="h-full bg-gradient-to-r from-red-400 to-red-600"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold italic">Immediate action recommended to prevent spread.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                    <Icons.Farm size={20} className="text-emerald-500" />
                    Treatment Plan
                  </h3>

                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-emerald-100 transition-all">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400 border border-gray-100">1</div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-sm text-gray-900">Isolate Infected Area</h4>
                        <p className="text-xs text-gray-500 font-medium">Mark the affected zone to avoid spreading spores to healthy crops. Avoid walking through wet crops.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-emerald-100 transition-all">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400 border border-gray-100">2</div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-sm text-gray-900">Apply Fungicide</h4>
                        <p className="text-xs text-gray-500 font-medium">Spray Propiconazole (Tilt) or Tebuconazole (Folicur) mixed with water.</p>
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-emerald-500">
                              <Droplets size={20} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-900">Tilt 25 EC</p>
                              <p className="text-[10px] text-gray-400">₹450 / 250ml</p>
                            </div>
                          </div>
                          <button className="text-[10px] font-black text-emerald-600 hover:underline">Find Store</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-emerald-100 transition-all">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400 border border-gray-100">3</div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-sm text-gray-900">Monitor Moisture</h4>
                        <p className="text-xs text-gray-500 font-medium">Reduce irrigation frequency. High humidity accelerates rust growth.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={reset} className="flex-1 py-4 border border-gray-100 rounded-2xl text-xs font-black text-gray-900 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <Plus size={16} /> Save Report
                  </button>
                  <button className="flex-[1.5] py-4 bg-emerald-500 text-white rounded-2xl text-xs font-black hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                    <MessageSquare size={16} /> Contact Expert
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetector;