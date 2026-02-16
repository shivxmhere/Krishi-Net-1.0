import React, { useState, useRef } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle, Leaf, Loader2, ScanLine, AlertTriangle, ShieldCheck, ThermometerSun, ChevronRight, Droplets, Sprout } from 'lucide-react';
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
      const result = await analyzePlantImage(base64Data, selectedCrop, language);
      setAnalysis(result);
      saveScan(selectedCrop, fullImageString, result, user?.location || 'Unknown');
      if(navigator.vibrate) navigator.vibrate([10, 50, 10]);
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

  // --- Sub-Components ---

  const ConfidenceGauge = ({ value }: { value: number }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value * circumference);
    const color = value > 0.8 ? '#22C55E' : value > 0.5 ? '#F97316' : '#EF4444';

    return (
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="transform -rotate-90 w-24 h-24 drop-shadow-lg">
          <circle
            cx="48" cy="48" r={radius}
            stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="transparent"
          />
          <motion.circle
            cx="48" cy="48" r={radius}
            stroke={color} strokeWidth="8" fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xl font-bold font-heading text-gray-800 dark:text-white"
          >
            {Math.round(value * 100)}%
          </motion.span>
          <span className="text-[10px] uppercase font-bold text-gray-500">Confidence</span>
        </div>
      </div>
    );
  };

  const ScanningOverlay = () => (
    <div className="absolute inset-0 z-20 overflow-hidden rounded-[2rem]">
      <motion.div
        className="w-full h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_20px_rgba(74,222,128,0.8)]"
        animate={{ top: ['-10%', '110%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute' }}
      />
      <div className="absolute inset-0 bg-primary-500/10 mix-blend-overlay" />
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20">
        {[...Array(36)].map((_, i) => (
          <div key={i} className="border-[0.5px] border-white/30" />
        ))}
      </div>
      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-primary-500/30 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
          <span className="text-primary-50 font-mono text-sm tracking-widest">ANALYZING BIOMETRICS...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white flex items-center gap-3">
             <span className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
               <ScanLine className="w-6 h-6" />
             </span>
             Smart Diagnosis
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 ml-1">AI-Powered Crop Disease Detection</p>
        </div>
        {image && (
          <button 
            onClick={reset}
            className="p-3 bg-white dark:bg-gray-800 text-gray-500 hover:text-red-500 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </motion.div>

      {!image ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          {/* Crop Selector */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Select Crop Context</h3>
            <div className="flex flex-wrap gap-3">
              {SUPPORTED_CROPS.map(crop => (
                <button
                  key={crop}
                  onClick={() => setSelectedCrop(crop)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    selectedCrop === crop
                      ? 'bg-primary-500 text-white border-primary-600 shadow-lg shadow-primary-500/20'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary-400'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => fileInputRef.current?.click()}
            className="relative cursor-pointer group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-sky-500 rounded-[2.5rem] opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500" />
            <div className="relative bg-white dark:bg-gray-800 border-4 border-dashed border-gray-200 dark:border-gray-700 group-hover:border-primary-400 dark:group-hover:border-primary-500 rounded-[2.5rem] p-16 text-center transition-colors duration-300">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <div className="w-24 h-24 mx-auto bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Capture or Upload</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Take a clear photo of the affected {selectedCrop} leaf for instant analysis.
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Image Preview Column */}
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700 bg-gray-900">
            <img 
              src={image} 
              alt="Uploaded plant" 
              className="w-full h-full object-cover" 
            />
            {loading && <ScanningOverlay />}
          </div>

          {/* Results Column */}
          <div className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-800"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">{error}</span>
              </motion.div>
            )}

            <AnimatePresence>
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="space-y-6"
                >
                  {/* Top Card: Diagnosis */}
                  <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-premium border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[4rem] opacity-10 ${
                       analysis.severity === 'High' ? 'bg-red-500' : analysis.severity === 'Healthy' ? 'bg-green-500' : 'bg-orange-500'
                    }`} />
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                             {selectedCrop}
                           </span>
                           {analysis.severity !== 'Healthy' && (
                             <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide shadow-sm ${
                                analysis.severity === 'High' ? 'bg-red-500' : 'bg-orange-500'
                             }`}>
                               {analysis.severity} Severity
                             </span>
                           )}
                        </div>
                        <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white leading-tight mb-2">
                          {analysis.diseaseName}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
                          {analysis.description}
                        </p>
                      </div>
                      <ConfidenceGauge value={analysis.confidence} />
                    </div>
                  </div>

                  {/* Immediate Action */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-2xl p-5 flex gap-4"
                  >
                     <div className="bg-sky-500 rounded-xl p-3 h-fit text-white shadow-lg shadow-sky-500/30">
                       <ShieldCheck className="w-6 h-6" />
                     </div>
                     <div>
                       <h4 className="font-bold text-sky-900 dark:text-sky-100 text-lg">Recommended Action</h4>
                       <p className="text-sky-800 dark:text-sky-200 mt-1">{analysis.nextSteps}</p>
                     </div>
                  </motion.div>

                  {/* Treatments Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Chemical */}
                    {analysis.treatment.length > 0 && (
                      <motion.div 
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.3 }}
                         className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm"
                      >
                         <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                           <AlertTriangle className="w-4 h-4 text-red-500" />
                           Treatment
                         </h4>
                         <ul className="space-y-2">
                           {analysis.treatment.map((t, i) => (
                             <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                               {t}
                             </li>
                           ))}
                         </ul>
                      </motion.div>
                    )}

                    {/* Organic */}
                    <motion.div 
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.4 }}
                       className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-primary-100 dark:border-primary-900/30 shadow-sm"
                    >
                       <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                         <Leaf className="w-4 h-4 text-primary-500" />
                         Organic / Home
                       </h4>
                       <ul className="space-y-2">
                         {analysis.organicAlternatives.map((t, i) => (
                           <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                             {t}
                           </li>
                         ))}
                       </ul>
                    </motion.div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-center"
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-bold border border-primary-100 dark:border-primary-800">
                      <CheckCircle className="w-4 h-4" />
                      Scan automatically saved to History
                    </div>
                  </motion.div>
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