import { useState, useEffect, useRef } from 'react';
import { Brain, Mic, Send, Lightbulb, MapPin, Loader2, StopCircle } from 'lucide-react';
import { useAuthStore, useAdminStore, ROLES } from '@cleanflow/core';
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
      // Mock fallback
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

export default function HygeneXPage() {
  const { role } = useAuthStore();
  const { messages, isTyping, metrics, initChat, stopChat, sendMessage } = useHygenexStore();
  const { b2bMarketStats, fetchB2BData } = useAdminStore();
  const [inputText, setInputText] = useState("");
  const chatBottomRef = useRef(null);
  
  const { isListening, startListening, stopListening } = useVoiceRecognition();

  useEffect(() => {
    initChat();
    if (role === ROLES.BUSINESS) {
      fetchB2BData();
    }
    return () => stopChat();
  }, [initChat, stopChat, role]);

  useEffect(() => {
    // Auto scroll
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

  const submitPrompt = (prompt) => {
    sendMessage(prompt);
  };

  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening((text) => setInputText(text));
  };

  const userPrompts = [
    "Predict my waste for next week", 
    "Give me tips to reduce odour", 
    "Show my rewards",
    "How do I recycle batteries?"
  ];

  const adminPrompts = [
    "Generate NEMA report for all estates", 
    "Show high-risk areas today", 
    "Analyze compliance trends",
    "Suggest interventions for Block 7"
  ];

  const businessPrompts = [
    "What are the trending material prices?",
    "Generate a B2B NEMA compliance report",
    "Analyze demand for Recycled Pellets",
    "Optimize my listing for industrial buyers"
  ];

  const prompts = role === ROLES.ADMIN ? adminPrompts : role === ROLES.BUSINESS ? businessPrompts : userPrompts;

  // Render Left Sidebar for Business (Market Intel)
  const renderMarketIntelDashboard = () => (
    <div className="hidden lg:flex flex-col w-1/3 min-w-[320px] max-w-sm border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Market Intelligence</h2>
        
        <div className="space-y-3">
          {b2bMarketStats.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Analyzing...</p>
            </div>
          ) : (
            b2bMarketStats.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform cursor-pointer">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100">{item.price}</p>
                </div>
                <span className={`text-[10px] font-black ${item.color}`}>{item.trend}</span>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="p-6">
        <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Supply Forecast</h2>
        <div className="p-5 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            HygeneX predicts a <span className="text-primary font-black">15% surge</span> in Plastic demand over the next 14 days due to manufacturer shortages.
          </p>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-primary w-[75%] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col lg:flex-row absolute inset-0 ${role === ROLES.ADMIN ? 'lg:static lg:h-[calc(100dvh-56px)]' : 'lg:static lg:h-[calc(100dvh-56px-70px)]'}`}>
      
      {/* Sidebar for Admin or Business */}
      {role === ROLES.ADMIN ? renderOversightDashboard() : role === ROLES.BUSINESS ? renderMarketIntelDashboard() : null}

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 max-h-full overflow-hidden">
        
        {/* Chat Header */}
        <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur flex justify-between flex-none z-10 z-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center relative">
              <Brain className="w-5 h-5 text-primary" />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-950 animate-pulse"></div>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white leading-tight">HygeneX</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your Waste Intelligence Assistant</p>
            </div>
          </div>
          {role === ROLES.ADMIN && (
             <span className="hidden sm:inline-flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-500/20">
               Optimizing 12 Estates
             </span>
          )}
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 space-y-6">
          {messages.length === 1 && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 w-full max-w-3xl mx-auto">
               {prompts.map((p, i) => (
                 <button 
                  key={i} 
                  onClick={() => submitPrompt(p)}
                  className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary rounded-2xl text-left transition-colors text-sm text-slate-700 dark:text-slate-300 group"
                 >
                   <Lightbulb className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors flex-none" />
                   <span>{p}</span>
                 </button>
               ))}
             </div>
          )}

          <div className="w-full max-w-3xl mx-auto space-y-8">
            {messages.map((msg) => {
              const isAi = msg.role === 'ai';
              return (
                <div key={msg.id} className={`flex gap-4 ${isAi ? '' : 'justify-end'}`}>
                  {isAi && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-none mt-1 shadow-sm border border-primary/20">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isAi 
                     ? 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm' 
                     : 'bg-primary text-white rounded-tr-sm shadow-md shadow-primary/20'
                  }`}>
                    {msg.text}
                  </div>
                  {!isAi && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center flex-none mt-1 shadow-sm text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
                      {role === ROLES.ADMIN ? 'AD' : 'ME'}
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-none shadow-sm">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5 w-16">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 sm:px-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 flex-none pb-safe">
          <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-1.5 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all shadow-sm">
            
            <button 
              onClick={toggleMic}
              className={`p-3 rounded-full flex-none transition-colors ${
                isListening 
                  ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-500 animate-pulse' 
                  : 'bg-transparent text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary'
              }`}
              title="Speak to HygeneX"
            >
              {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Message HygeneX..."}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3.5 px-2 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 max-h-32 min-h-[44px]"
              rows={1}
            />

            <button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`p-3 rounded-full flex-none transition-all ${
                inputText.trim() 
                  ? 'bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary-dark translate-y-0 opacity-100' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 opacity-50 scale-95 pointer-events-none'
              }`}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
          <div className="text-center mt-3 text-[10px] text-slate-400 dark:text-slate-600 font-medium pb-8 lg:pb-0">
            HygeneX can make mistakes. Consider verifying important metrics.
          </div>
        </div>
      </div>
    </div>
  );
}
