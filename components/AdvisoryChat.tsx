import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { getAdvisoryResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { SUGGESTED_QUESTIONS, MOCK_WEATHER } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useVoice } from '../contexts/VoiceContext';

const AdvisoryChat: React.FC = () => {
  const { language } = useLanguage();
  const { isListening, lastCommand } = useVoice(); // Use Voice Context
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: language === 'hi' ? 'नमस्ते! मैं आपका कृषि- friend हूँ। पूछिए क्या मदद करूँ?' :
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

  // Handle Voice Input
  useEffect(() => {
    if (lastCommand) {
      // If not a navigation command (handled in Layout), likely a chat message
      if (!input && !loading) {
        setInput(lastCommand);
        // Optional: Auto-send if it sounds like a question
        // handleSend(lastCommand); 
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
      const context = `Weather today is ${MOCK_WEATHER.condition}, ${MOCK_WEATHER.temp}°C. Humidity ${MOCK_WEATHER.humidity}%. Forecast: Rain chance ${MOCK_WEATHER.forecast[1].rainChance}% tomorrow.`;

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
    <div className="h-[calc(100vh-8rem)] max-w-4xl mx-auto flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-green-600 p-4 flex items-center gap-3 text-white">
        <div className="bg-white/20 p-2 rounded-full">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">Smart Advisory</h2>
          <p className="text-green-100 text-sm">Online • AI Assistant</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
              ? 'bg-blue-600 text-white rounded-tr-none'
              : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              <span className={`text-xs mt-2 block ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-green-600" />
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length < 3 && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Suggested Questions
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-4 py-2 bg-white border border-green-200 text-green-700 rounded-full text-sm hover:bg-green-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about crops, weather, or fertilizers..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisoryChat;
