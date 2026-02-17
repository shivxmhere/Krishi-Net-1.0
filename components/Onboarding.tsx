import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
// import { Background } from './Background';
import { Icons } from './ui/IconSystem';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    title: 'Smart Diagnosis',
    subtitle: 'Identify 38+ crop diseases instantly with AI-powered precision.',
    icon: Icons.Disease,
    color: 'from-harvest-green to-leaf-green',
    textColor: 'text-harvest-green dark:text-sprout-green'
  },
  {
    id: 2,
    title: 'Weather Intelligence',
    subtitle: '7-day hyper-local forecasts & risk alerts for your farm.',
    icon: Icons.Weather,
    color: 'from-sky-morning to-blue-600',
    textColor: 'text-sky-morning'
  },
  {
    id: 3,
    title: 'Market Insights',
    subtitle: 'Real-time mandi prices & trends to maximize your profits.',
    icon: Icons.Market,
    color: 'from-earth-golden to-earth-amber',
    textColor: 'text-earth-golden'
  },
  {
    id: 4,
    title: 'Expert Guidance',
    subtitle: 'Scientific treatment plans & best practices for better yield.',
    icon: Icons.Advisory,
    color: 'from-purple-500 to-indigo-600',
    textColor: 'text-purple-500 dark:text-purple-400'
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0, scale: 0.9 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 300 : -300, opacity: 0, scale: 0.9 })
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Background removed */}

      <div className="w-full max-w-md h-full flex flex-col justify-between p-6 relative z-10">
        <GlassCard className="flex-1 flex flex-col items-center justify-center relative overflow-hidden my-4 border-2 border-glass-border">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="absolute w-full px-6 flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className={`w-40 h-40 rounded-[2rem] bg-gradient-to-br ${slides[currentIndex].color} shadow-xl flex items-center justify-center mb-8 text-white`}
              >
                {React.createElement(slides[currentIndex].icon, { size: 72 })}
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className={`text-3xl font-display font-bold mb-4 ${slides[currentIndex].textColor}`}
              >
                {slides[currentIndex].title}
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-earth-soil dark:text-gray-300 text-lg leading-relaxed font-medium"
              >
                {slides[currentIndex].subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </GlassCard>

        <div className="flex flex-col gap-6 mb-4">
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <motion.div
                key={index}
                animate={{ width: index === currentIndex ? 24 : 8, backgroundColor: index === currentIndex ? '#16a34a' : 'rgba(107, 114, 128, 0.3)' }}
                className="h-2 rounded-full transition-colors"
              />
            ))}
          </div>

          <Button onClick={handleNext} className="w-full py-4 text-lg shadow-lg">
            {currentIndex === slides.length - 1 ? (
              <>Get Started <Check className="ml-2 w-5 h-5" /></>
            ) : (
              <>Next <ChevronRight className="ml-2 w-5 h-5" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;