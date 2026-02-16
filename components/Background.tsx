import React from 'react';
import { motion } from 'framer-motion';

interface BackgroundProps {
  mode: 'day' | 'night' | 'sunrise' | 'rain';
}

const Background: React.FC<BackgroundProps> = ({ mode }) => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Base Gradient Layer - Green and Blue Theme */}
      <motion.div
        animate={{
          background: mode === 'night' 
            ? 'linear-gradient(to bottom, #064e3b 0%, #1e3a8a 100%)' // Dark Green to Dark Blue
            : 'linear-gradient(135deg, #d1fae5 0%, #dbeafe 100%)' // Light Green to Light Blue
        }}
        className="absolute inset-0 transition-colors duration-1000"
      />

      {/* Floating Elements (Clouds/Bubbles) */}
      {mode === 'night' ? (
        <>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-agri-green-300 rounded-full opacity-30"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                opacity: [0.2, 0.6, 0.2],
                y: [null, Math.random() * -50]
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ width: 4, height: 4 }}
            />
          ))}
        </>
      ) : (
        <>
           {/* Abstract Green/Blue Orbs */}
           <motion.div 
             className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-agri-green-200/40 blur-3xl rounded-full"
             animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
             transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
           />
           <motion.div 
             className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-farm-blue-200/40 blur-3xl rounded-full"
             animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
             transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
           />
        </>
      )}

      {/* Glass Overlay Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
    </div>
  );
};

export default Background;