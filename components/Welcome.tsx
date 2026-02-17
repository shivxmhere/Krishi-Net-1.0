import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
// import { Background } from './Background';
import { User } from '../types';
import { GlassCard } from './ui/GlassCard';
import { Icons } from './ui/IconSystem';
import { Button } from './ui/Button';

interface WelcomeProps {
  user: User;
  onGetStarted: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ user, onGetStarted }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
// Background removed for simple UI
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8 text-center border-2 border-harvest-green/30">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-harvest-green to-leaf-green rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow-green text-white"
          >
            <Icons.Logo size={48} />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-display font-bold text-deep-earth dark:text-white mb-2"
          >
            Welcome, {user.name.split(' ')[0]}! 🌾
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-earth-soil dark:text-gray-400 mb-8 font-medium leading-relaxed"
          >
            Your digital farm is ready. Let's start by adding your first crop to protect it using our advanced AI tools.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onGetStarted}
              className="w-full py-4 text-lg shadow-xl shadow-harvest-green/20"
            >
              Add My First Crop <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Welcome;
