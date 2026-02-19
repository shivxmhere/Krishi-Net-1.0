import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from './ui/IconSystem';

interface SplashScreenProps {
    onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    React.useEffect(() => {
        const timer = setTimeout(onComplete, 1500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#022c22] overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Ambient glow */}
            <div className="absolute w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

            {/* Logo */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-8"
            >
                <Icons.Logo size={52} />
            </motion.div>

            {/* App Name */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-5xl font-display font-bold text-white tracking-tight mb-2"
            >
                Krishi-Net
            </motion.h1>

            {/* Tagline */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-emerald-300/80 text-xs font-bold uppercase tracking-[0.4em] mb-12"
            >
                Smart AI Agriculture
            </motion.p>

            {/* Credits */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute bottom-12 text-center"
            >
                <p className="text-emerald-200/60 text-xs font-bold tracking-wider">Made by</p>
                <p className="text-white text-sm font-bold mt-1 tracking-wide">
                    Techlions — Shivam Singh
                </p>
                <p className="text-emerald-300/50 text-[10px] font-bold mt-0.5 tracking-widest uppercase">
                    IIT Patna
                </p>
            </motion.div>

            {/* Loading bar */}
            <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
            />
        </motion.div>
    );
};

export default SplashScreen;
