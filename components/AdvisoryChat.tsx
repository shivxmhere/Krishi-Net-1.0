import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles, User, Sprout } from 'lucide-react';
import { getAdvisoryResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { SUGGESTED_QUESTIONS, MOCK_WEATHER } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useVoice } from '../contexts/VoiceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { Icons } from './ui/IconSystem';
import { Button } from './ui/Button';

const AdvisoryChat: React.FC = () => {
  const { language } = useLanguage();
  const { isListening, lastCommand } = useVoice();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: language === 'hi' ? 'नमस्ते! मैं आपका कृषि-मित्र हूँ। पूछिए क्या मदद करूँ?' :
        language === 'ur' ? 'آداب! میں آپ کا کرشی دوست ہوں۔ بتائیے کیا مدد کروں؟' :
          'Namaste! I am your Krishi Friend 🌾. Ask me anything about your farm!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isListening]);

  useEffect(() => {
    if (lastCommand) {
      if (!input && !loading) {
        setInput(lastCommand);
      }
    }
  }, [lastCommand]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const context = `Weather: ${MOCK_WEATHER.condition}, ${MOCK_WEATHER.temp}°C. Humidity ${MOCK_WEATHER.humidity}%.`;
      const response = await getAdvisoryResponse(text, history, context, language);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] max-w-5xl mx-auto flex flex-col gap-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 px-2">
        <div className="w-12 h-12 bg-gradient-to-br from-harvest-green to-sprout-green rounded-2xl flex items-center justify-center text-white shadow-glow-green">
          <Icons.Advisory size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-deep-earth dark:text-white">Smart Advisory</h2>
          <p className="text-earth-soil dark:text-gray-400 font-medium">Your 24/7 AI Agri-Expert</p>
        </div>
      </motion.div>

      <GlassCard className="flex-1 flex flex-col overflow-hidden border-2 border-glass-border">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={msg.id}
              className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-earth-golden to-earth-amber text-deep-earth'
                  : 'bg-gradient-to-br from-harvest-green to-leaf-green text-white'
                }`}>
                {msg.role === 'user' ? <User size={20} /> : <Sprout size={20} />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[85%] md:max-w-[70%] p-4 shadow-sm relative group ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-earth-golden to-earth-amber text-white rounded-2xl rounded-br-none'
                  : 'bg-white/80 dark:bg-white/10 text-deep-earth dark:text-gray-100 rounded-2xl rounded-bl-none border border-glass-border'
                }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.text}</p>
                <span className={`text-[10px] font-bold mt-2 block opacity-70 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'text-white/80' : 'text-earth-soil/60 dark:text-gray-500'
                  }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-end gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-harvest-green to-leaf-green text-white flex items-center justify-center shrink-0 shadow-md">
                <Sprout size={20} />
              </div>
              <div className="bg-white/80 dark:bg-white/10 p-4 rounded-2xl rounded-bl-none border border-glass-border flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-harvest-green rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-harvest-green rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-harvest-green rounded-full animate-bounce"></span>
                </div>
                <span className="text-xs font-bold text-harvest-green dark:text-sprout-green uppercase tracking-wider">Thinking</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/40 dark:bg-black/20 backdrop-blur-md border-t border-glass-border space-y-4">
          {/* Suggestions */}
          {messages.length < 3 && !loading && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap px-4 py-2 bg-white/60 dark:bg-white/10 border border-glass-border text-harvest-green dark:text-sprout-green rounded-full text-xs font-bold hover:bg-sprout-green/20 hover:border-sprout-green/50 transition-all flex items-center gap-2"
                >
                  <Sparkles size={12} /> {q}
                </motion.button>
              ))}
            </div>
          )}

          <div className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about crops..."
              className="flex-1 px-6 py-4 bg-white/50 dark:bg-black/20 border border-glass-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-sprout-green/50 focus:bg-white/80 dark:focus:bg-deep-earth/80 transition-all placeholder:text-gray-400 text-deep-earth dark:text-white"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 bottom-2 rounded-xl px-4"
              variant={!input.trim() ? "ghost" : "primary"}
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default AdvisoryChat;
