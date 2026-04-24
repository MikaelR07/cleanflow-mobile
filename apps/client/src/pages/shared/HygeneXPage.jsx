import { useState, useEffect, useRef } from 'react';
import { Brain, Mic, Send, Lightbulb, MapPin, Loader2, StopCircle, ShieldCheck, Activity, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore, ROLES } from '@cleanflow/core';
import { useHygenexStore } from '@cleanflow/core';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';


// Fix for leaflet marker icon missing locally usually
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Voice Hook
function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const startListening = (onResult) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Mock fallback for browsers without speech recognition
      setIsListening(true);
      setTimeout(() => {
        onResult("Predict my waste for next week");
        setIsListening(false);
      }, 2000);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };
  
  return { isListening, startListening, stopListening };
}

// Premium Waveform Component
const Waveform = ({ isListening, isTyping }) => {
  return (
    <div className="flex items-center gap-1.5 h-12 px-4">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={isListening || isTyping ? {
            height: [8, 24, 8, 32, 8],
            opacity: [0.3, 1, 0.3],
          } : {
            height: 4,
            opacity: 0.1,
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          className="w-1.5 rounded-full bg-emerald-500"
        />
      ))}
    </div>
  );
};

export default function HygeneXPage() {
  const { role } = useAuthStore();
  const { messages, isTyping, metrics, initChat, stopChat, sendMessage } = useHygenexStore();
  const [inputText, setInputText] = useState("");
  const chatBottomRef = useRef(null);
  
  const { isListening, startListening, stopListening } = useVoiceRecognition();

  useEffect(() => {
    initChat();
    return () => stopChat();
  }, [initChat, stopChat]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening((text) => setInputText(text));
  };

  return (
    <div className="flex flex-col lg:flex-row relative bg-slate-950 text-white overflow-hidden shadow-2xl h-[calc(100dvh-140px)] lg:h-[calc(100dvh-56px-70px)] rounded-[2rem] lg:rounded-[2.5rem] border border-slate-800">
      
      {/* 1. OVERSIGHT PANEL (LEFT) */}
      <div className="hidden lg:flex flex-col w-80 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl">
        <div className="p-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8">AI Neural Metrics</h2>
          
          <div className="space-y-6">
            {[
              { label: "Estates Monitored", val: metrics.estates, icon: MapPin, color: "emerald" },
              { label: "Active Verifiers", val: metrics.activeAgents, icon: ShieldCheck, color: "blue" },
              { label: "Segregation Rate", val: `${metrics.segregationRate}%`, icon: Activity, color: "amber" },
            ].map((m, i) => (
              <div key={i} className="group cursor-default">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</span>
                  <span className={`text-xl font-black text-${m.color}-500 group-hover:scale-110 transition-transform`}>{m.val}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "70%" }}
                    className={`h-full bg-${m.color}-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
           <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Neural Status</div>
                <div className="text-xs font-bold text-white">Active & Learning</div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. CHAT ENGINE (CENTER) */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        {/* Header */}
        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Brain className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-4 border-slate-950 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-white">HygeneX <span className="text-emerald-500">v2.0</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">CleanFlow Operations Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Waveform isListening={isListening} isTyping={isTyping} />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-10 space-y-10">
          <div className="max-w-3xl mx-auto space-y-10">
            {messages.map((msg) => {
              const isAi = msg.role === 'ai';
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex gap-6 ${isAi ? '' : 'flex-row-reverse'}`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isAi ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    {isAi ? <Brain className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  
                  <div className={`relative p-6 rounded-[2rem] text-sm leading-relaxed max-w-[80%] border ${
                    isAi 
                      ? 'bg-white/[0.03] border-white/5 text-slate-200 rounded-tl-none' 
                      : 'bg-emerald-500 border-emerald-400 text-white font-medium rounded-tr-none shadow-xl shadow-emerald-500/20'
                  }`}>
                    {msg.text}
                    <div className={`absolute bottom-2 ${isAi ? 'right-4' : 'left-4'} text-[8px] font-black uppercase opacity-30`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {isTyping && (
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] rounded-tl-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatBottomRef} className="h-4" />
          </div>
        </div>

        {/* Input Control */}
        <div className="p-4 sm:p-8 border-t border-white/5 bg-slate-900/30 backdrop-blur-3xl">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "I'm listening..." : "Ask HygeneX about the ecosystem..."}
                className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-4 px-14 sm:py-6 sm:px-16 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all resize-none min-h-[56px] sm:min-h-[72px]"
                rows={1}
              />
              
              <button 
                onClick={toggleMic}
                className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all ${
                  isListening ? 'bg-emerald-500 text-white animate-pulse shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'
                }`}
              >
                {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all ${
                  inputText.trim() ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'text-slate-700 pointer-events-none'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
              HygeneX Neural Interface • Encrypted & Autonomous
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
