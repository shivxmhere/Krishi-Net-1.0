
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle, Leaf, Loader2, ScanLine, AlertTriangle, ShieldCheck, ThermometerSun, History } from 'lucide-react';
import { analyzePlantImage } from '../services/geminiService';
import { saveScan } from '../services/historyService';
import { getCurrentUser } from '../services/authService';
import { DiseaseAnalysis, SUPPORTED_CROPS } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

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
      if(navigator.vibrate) navigator.vibrate(10);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setImage(base64String);
        analyzeImage(base64Data, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Data: string, fullImageString: string) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      // Pass crop context and language for specialized model inference
      const result = await analyzePlantImage(base64Data, selectedCrop, language);
      setAnalysis(result);
      
      // Save to History (Simulating Backend POST /api/detect)
      saveScan(selectedCrop, fullImageString, result, user?.location || 'Unknown');
      
      if(navigator.vibrate) navigator.vibrate([10, 50, 10]); // Success pattern
    } catch (err) {
      setError("Failed to analyze image. Please try again.");
      if(navigator.vibrate) navigator.vibrate(50);
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

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-500 text-white shadow-red-500/50';
      case 'medium': return 'bg-orange-500 text-white shadow-orange-500/50';
      case 'low': return 'bg-yellow-500 text-white shadow-yellow-500/50';
      case 'healthy': return 'bg-green-500 text-white shadow-green-500/50';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-black dark:text-white flex items-center gap-3">
            <span className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                <ScanLine className="w-6 h-6" />
            </span>
            Smart Diagnosis
          </h2>
          {image && (
            <button onClick={reset} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-black hover:bg-red-100 hover:text-red-500 transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {!image ? (
          <div className="space-y-6">
             {/* Context Selection */}
             <div className="bg-white/80 dark:bg-white/5 p-6 rounded-2xl border-2 border-agri-green-100 dark:border-gray-700">
               <label className="block text-sm font-black text-black dark:text-gray-300 mb-4 uppercase tracking-wider">
                 Step 1: Select Crop Type
               </label>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                 {SUPPORTED_CROPS.map(crop => (
                   <button
                     key={crop}
                     onClick={() => setSelectedCrop(crop)}
                     className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-all border-2 ${
                       selectedCrop === crop 
                       ? 'bg-black text-white border-black shadow-lg scale-105' 
                       : 'bg-white text-black border-gray-200 hover:border-black'
                     }`}
                   >
                     {crop}
                   </button>
                 ))}
               </div>
             </div>

             <motion.div 
              whileHover={{ scale: 1.01 }}
              className="border-4 border-dashed border-agri-green-300 dark:border-agri-green-800 rounded-[2rem] p-16 text-center bg-agri-green-50/50 cursor-pointer transition-colors relative overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <div className="flex flex-col items-center gap-6 relative z-10">
                <div className="w-24 h-24 bg-gradient-to-tr from-agri-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl shadow-agri-green-500/20 group-hover:scale-110 transition-transform">
                  <Camera className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-black">Step 2: Capture {selectedCrop} Leaf</h3>
                  <p className="text-black/60 font-medium mt-2">AI will analyze severity & spread instantly.</p>
                </div>
                <button className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 border border-black">
                  <Upload className="w-5 h-5" />
                  Select Image
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-xl aspect-square">
              <img src={image} alt="Uploaded plant" className="w-full h-full object-cover" />
              
              {/* Scanning Animation */}
              {loading && (
                <div className="absolute inset-0 z-10">
                   <motion.div 
                     className="w-full h-1 bg-neon-green shadow-[0_0_20px_#39ff14]"
                     animate={{ top: ['0%', '100%', '0%'] }}
                     transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                     style={{ position: 'absolute' }}
                   />
                   <div className="absolute inset-0 bg-agri-green-500/10 mix-blend-overlay"></div>
                   
                   {/* Scanning Grid Overlay */}
                   <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-30">
                      {[...Array(16)].map((_, i) => (
                         <div key={i} className="border border-white/50"></div>
                      ))}
                   </div>

                   <div className="absolute bottom-8 left-0 right-0 text-center space-y-2">
                     <div className="inline-flex items-center gap-2 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full text-neon-green font-mono font-bold text-sm border border-neon-green/30">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       ANALYZING CROP HEALTH...
                     </div>
                   </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-red-100 text-red-800 rounded-xl flex items-start gap-3 border-2 border-red-200 font-bold"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}

              <AnimatePresence>
                {analysis && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {/* Diagnosis Header */}
                    <div className="bg-white/90 rounded-2xl p-6 border-2 border-agri-green-200 shadow-xl relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Detected Issue</p>
                            <h3 className="text-3xl font-black text-black leading-none">{analysis.diseaseName}</h3>
                          </div>
                          <div className={`px-4 py-2 rounded-xl font-bold text-sm shadow-lg border-2 border-white/20 ${getSeverityColor(analysis.severity)}`}>
                             {analysis.severity} Severity
                          </div>
                        </div>
                        
                        <p className="mt-4 text-black font-medium leading-relaxed">
                          {analysis.description}
                        </p>

                        <div className="mt-4 flex items-center gap-4 text-xs font-bold text-gray-500">
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                             <ScanLine className="w-3 h-3" />
                             Confidence: {(analysis.confidence * 100).toFixed(1)}%
                          </span>
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                             <ThermometerSun className="w-3 h-3" />
                             Context: {selectedCrop}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Immediate Action */}
                    <div className="bg-farm-blue-50 p-5 rounded-2xl border-2 border-farm-blue-200 flex gap-4 items-start shadow-sm">
                      <div className="bg-farm-blue-500 rounded-xl p-3 text-white shadow-lg shadow-farm-blue-500/30">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-farm-blue-900 text-lg">Recommended Action</h4>
                        <p className="text-farm-blue-800 font-semibold text-sm mt-1">{analysis.nextSteps}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-5 rounded-2xl border-2 border-red-100 shadow-sm">
                        <h4 className="font-black text-black mb-3 flex items-center gap-2 text-sm uppercase tracking-wide text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          Chemical Treatment
                        </h4>
                        <ul className="space-y-2">
                          {analysis.treatment.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm font-semibold text-gray-700">
                              <span className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border-2 border-agri-green-100 shadow-sm">
                        <h4 className="font-black text-black mb-3 flex items-center gap-2 text-sm uppercase tracking-wide text-agri-green-600">
                          <Leaf className="w-4 h-4" />
                          Organic / Home
                        </h4>
                        <ul className="space-y-2">
                          {analysis.organicAlternatives.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm font-semibold text-gray-700">
                              <span className="w-2 h-2 rounded-full bg-agri-green-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 justify-center p-3 bg-green-50 rounded-xl text-green-700 text-sm font-bold border border-green-200">
                      <CheckCircle className="w-4 h-4" />
                      Scan saved to Farm History
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DiseaseDetector;
