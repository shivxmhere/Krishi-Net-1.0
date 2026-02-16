import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Sprout, CloudSun, TrendingUp, ShieldCheck } from 'lucide-react';
import Background from './Background';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    title: 'Smart Diagnosis',
    subtitle: 'Identify 38+ crop diseases instantly with AI-powered precision.',
    icon: Sprout,
    color: 'bg-primary-500',
    textColor: 'text-primary-500'
  },
  {
    id: 2,
    title: 'Weather Intelligence',
    subtitle: '7-day hyper-local forecasts & risk alerts for your farm.',
    icon: CloudSun,
    color: 'bg-sky-500',
    textColor: 'text-sky-500'
  },
  {
    id: 3,
    title: 'Market Insights',
    subtitle: 'Real-time mandi prices & trends to maximize your profits.',
    icon: TrendingUp,
    color: 'bg-earth-500',
    textColor: 'text-earth-500'
  },
  {
    id: 4,
    title: 'Expert Guidance',
    subtitle: 'Scientific treatment plans & best practices for better yield.',
    icon: ShieldCheck,
    color: 'bg-purple-500',
    textColor: 'text-purple-500'
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
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    })
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900">
      <Background mode="day" />
      
      <div className="w-full max-w-md h-full flex flex-col justify-between p-8 relative">
        <div className="flex-1 flex items-center justify-center relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full flex flex-col items-center text-center"
            >
              <motion.div 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className={`w-48 h-48 rounded-[2rem] ${slides[currentIndex].color} shadow-premium flex items-center justify-center mb-12`}
              >
                {React.createElement(slides[currentIndex].icon, { size: 80, className: "text-white" })}
              </motion.div>
              
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`text-3xl font-heading font-bold mb-4 ${slides[currentIndex].textColor}`}
              >
                {slides[currentIndex].title}
              </motion.h2>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed font-medium"
              >
                {slides[currentIndex].subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-8 mb-8 z-10">
          {/* Progress Indicators */}
          <div className="flex justify-center gap-3">
            {slides.map((_, index) => (
              <motion.div
                key={index}
                animate={{
                  width: index === currentIndex ? 32 : 10,
                  backgroundColor: index === currentIndex ? '#22C55E' : '#D1D5DB'
                }}
                className="h-2.5 rounded-full"
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className={`w-full py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-white font-bold text-lg transition-colors ${slides[currentIndex].color}`}
          >
            {currentIndex === slides.length - 1 ? (
              <>
                Get Started <Check className="w-6 h-6" />
              </>
            ) : (
              <>
                Next <ChevronRight className="w-6 h-6" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;