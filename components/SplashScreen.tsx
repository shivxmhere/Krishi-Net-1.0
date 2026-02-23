import React from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
    onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);

    React.useEffect(() => {
        // Auto-dismiss after 4s (or on button click)
        const timer = setTimeout(onComplete, 4000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* ── Full-Screen Background Image (Drone Shot) ── */}
            <div className="absolute inset-0 z-0">
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
                {/* Aerial farmland image – hotlinked */}
                <motion.img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUdA7HHIH09rp_RPVPBinzB1_eDkyZ9NSoHOCBA9i4MFHxYfm3hXKc25KnpvWHYWYg1q5_PYgX7tuCx7MCl51wf87-xy56yVmkf3mQzYzo1zOqdpOlpEwaYnVxU0HPPHu6Os61VhcPtoyryryhnRSJuneaMqj0ZAqvIvR8ftCyipvjuGTnu__xuU7UBaf7a3gYhnktsLv2uLJDQF3hmGN6sUPZXufsEV2dNp3AsRCPOQJj46dIfM-o7pg-CZiAhFer90PcUmmBQrc"
                    alt="Aerial drone view of lush green Indian farmland with geometric crop patterns"
                    className="h-full w-full object-cover"
                    onLoad={() => setImageLoaded(true)}
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 6, ease: 'easeOut' }}
                />
            </div>

            {/* ── Content Layer ── */}
            <div className="relative z-20 flex h-full flex-col items-center justify-between p-6 md:p-12 lg:p-24">
                {/* Top Spacer */}
                <div className="flex-none h-16" />

                {/* ── Main Content ── */}
                <div className="flex flex-col items-center justify-center text-center flex-1 gap-6">
                    {/* Agriculture Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 }}
                        className="rounded-full bg-emerald-500/20 p-5 backdrop-blur-sm border border-emerald-400/30 shadow-[0_0_60px_-15px_rgba(16,185,129,0.4)]"
                    >
                        {/* Tractor / Agriculture SVG icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-12 h-12 md:w-14 md:h-14 text-emerald-400 drop-shadow-lg"
                        >
                            {/* Tractor body */}
                            <path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
                            <path d="M15 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0z" />
                            <path d="M9 17H15" />
                            <path d="M5 13h4l3-5h3v5" />
                            <path d="M15 8h3l2 5" />
                            <path d="M9 5V8" />
                        </svg>
                    </motion.div>

                    {/* Title with Gold Shimmer */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
                        className="splash-text-shimmer text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight uppercase drop-shadow-2xl select-none"
                    >
                        KRISHI-NET
                    </motion.h1>

                    {/* Divider */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="h-[2px] w-24 bg-emerald-400 rounded-full origin-center"
                    />

                    {/* Tagline */}
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="text-white/90 text-base md:text-2xl font-light tracking-[0.25em] uppercase drop-shadow-md"
                    >
                        AI-driven app for agriculture
                    </motion.h2>

                    {/* Enter Dashboard Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1, duration: 0.6 }}
                        className="mt-6 md:mt-10"
                    >
                        <button
                            onClick={onComplete}
                            className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-emerald-500/90 px-8 py-4 transition-all duration-300 hover:bg-emerald-500 hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.6)] ring-1 ring-white/20 backdrop-blur-sm cursor-pointer"
                        >
                            {/* Dashboard icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 h-5 text-gray-900"
                            >
                                <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
                            </svg>
                            <span className="text-gray-900 text-base md:text-lg font-bold tracking-wide uppercase">
                                Enter Dashboard
                            </span>
                            {/* Hover sweep */}
                            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                        </button>
                    </motion.div>
                </div>

                {/* ── Footer Credits ── */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                    className="flex flex-col items-center pb-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-3.5 h-3.5 text-emerald-400"
                        >
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                        </svg>
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">
                            Built by TechLions
                        </span>
                    </div>
                    <p className="text-slate-300/70 text-xs md:text-sm font-light tracking-wider text-center border-t border-white/10 pt-3 w-full max-w-xs">
                        Shivam Singh — IIT Patna
                    </p>
                </motion.div>
            </div>

            {/* ── Loading Progress Bar ── */}
            <motion.div
                className="absolute bottom-0 left-0 z-30 h-1 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.8, ease: 'easeInOut' }}
            />
        </motion.div>
    );
};

export default SplashScreen;
