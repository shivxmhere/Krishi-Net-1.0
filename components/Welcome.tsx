
import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, ArrowRight } from 'lucide-react';
import Background from './Background';
import { User } from '../types';

interface WelcomeProps {
  user: User;
  onGetStarted: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ user, onGetStarted }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Background mode="day" />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="bg-white rounded-[2.5rem] p-8 max-w-md w-full text-center shadow-2xl border-4 border-green-400 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Sprout className="w-12 h-12 text-green-600" />
        </motion.div>

        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-black text-gray-900 mb-2"
        >
          Welcome, {user.name.split(' ')[0]}! 🌾
        </motion.h2>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 mb-8 font-medium leading-relaxed"
        >
          Your digital farm is ready. Let's start by adding your first crop to protect it.
        </motion.p>
        
        <motion.button 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGetStarted}
          className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          Add My First Crop <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Welcome;
