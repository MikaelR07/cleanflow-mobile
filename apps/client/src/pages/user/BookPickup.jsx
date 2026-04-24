/**
 * Book Pickup Page — 3-Page Progressive Flow
 */
import { useState, useEffect } from 'react';
import { 
  Sparkles, Clock, Mic, Camera, Check, ChevronRight, 
  ArrowLeft, MapPin, Edit2, Scale, Calendar, Info, 
  ShoppingBag, Trash2, Wallet, Zap, Star, Plus, 
  ArrowUpRight, Info as InfoIcon, Truck, ShieldCheck, Smartphone,
  User, Home, Lock, Shield, CheckCircle2, AlertCircle, TrendingUp
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import { toast } from 'sonner';

import { 
  useBookingStore, useAuthStore, useServiceStore, usePriceStore,
  useSystemStore, uploadFile, MATERIAL_TYPES 
} from '@cleanflow/core';

// ── COMPACT MAP ICONS ───────────────────────────────────────────

const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `<div class="w-6 h-6 rounded-full bg-slate-900 border-2 border-white shadow-lg flex items-center justify-center"><span class="text-[9px]">🏠</span></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const agentIcon = (isSelected) => L.divIcon({
  className: 'custom-agent-icon',
  html: `<div class="relative w-7 h-7 rounded-lg ${isSelected ? 'bg-primary' : 'bg-emerald-500'} border-2 border-white shadow-xl flex items-center justify-center transition-all"><span class="text-[10px]">🚛</span></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 15); }, [center, map]);
  return null;
}

export default function BookPickup() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { 
    aiSuggestions, selectedTime, selectTime, createBooking, 
    liveAgents, fetchNearbyAgents, subscribeToAgents, cleanupAgents,
    generateTimeSuggestions 
  } = useBookingStore();
  const { categories, fetchCategories } = useServiceStore();
  const { prices, fetchPrices, getPriceForMaterial } = usePriceStore();
  const { fetchConfig, getConfigValue } = useSystemStore();

  const [step, setStep] = useState(1);
  const [wasteType, setWasteType] = useState(null);
  const [selectedSubItem, setSelectedSubItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customLocation, setCustomLocation] = useState(profile?.location || { estate: 'Westlands', latitude: -1.2635, longitude: 36.8048 });
  const [photo, setPhoto] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  
  // New: Hybrid Model State
  const [pickupMode, setPickupMode] = useState('pickup'); // 'pickup' | 'dropoff'
  const [selectedHub, setSelectedHub] = useState(null);
  
  const query = new URLSearchParams(useLocation().search);
  const initialMode = query.get('mode'); // 'service' | 'sell'

  const HUBS = [
    { id: 'hub-1', name: 'CleanFlow Central (Nairobi West)', lat: -1.2921, lng: 36.8219, address: 'Langata Rd, Opp T-Mall' },
    { id: 'hub-2', name: 'CleanFlow East (Industrial Area)', lat: -1.3142, lng: 36.8524, address: 'Enterprise Rd, Near Boma' },
    { id: 'hub-3', name: 'CleanFlow South (Syokimau)', lat: -1.4024, lng: 36.9421, address: 'Mombasa Rd, Gateway Mall' }
  ];

  const hubIcon = L.divIcon({
    className: 'custom-hub-icon',
    html: `<div class="w-8 h-8 rounded-xl bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center animate-bounce-slow"><span class="text-xs">🏢</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
  
  const [isManualTime, setIsManualTime] = useState(false);
  const [customDate, setCustomDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [customTime, setCustomTime] = useState('09:00');
  const [paymentNumber, setPaymentNumber] = useState(profile?.phone || '');

  useEffect(() => {
    fetchCategories(); 
    fetchPrices(); 
    fetchConfig(); // Fetch live system fees
    fetchNearbyAgents();
    generateTimeSuggestions(); 
    subscribeToAgents(); 
    
    // Auto-select based on mode
    if (initialMode === 'service') {
      const generalCat = categories.find(c => c.id === 'general');
      if (generalCat) {
        setWasteType(generalCat);
        setSelectedSubItem({ 
          id: `cat-${generalCat.id}`, 
          label: `${generalCat.label} (Mixed)`, 
          price_per_unit: 0, 
          unit: 'kg',
          slug: generalCat.id
        });
      }
    }

    return () => cleanupAgents();
  }, [initialMode, categories.length]);

  // ── PRICING (Powered by Market Hub) ──
  const selected = selectedSubItem || wasteType;
  const processingFee = selected ? (selected.price_per_unit || 0) * quantity : 0;
  const logisticsFee = pickupMode === 'dropoff' ? 0 : getConfigValue('fee_pickup', 100); 
  const minPickupFee = pickupMode === 'dropoff' ? 0 : getConfigValue('fee_min_pickup', 100);
  
  const baseTotal = processingFee + logisticsFee;
  const subtotal = Math.max(baseTotal, minPickupFee);
  const discountAmount = selectedTime ? (subtotal * (selectedTime.discount / 100)) : 0;
  const finalPrice = Math.max(0, subtotal - discountAmount);

  // Live Oracle Match
  const isCategory = selected?.id?.startsWith('cat-');
  const liveRatePerKg = isCategory 
    ? usePriceStore.getState().getCategoryPrice(wasteType?.label || '') 
    : getPriceForMaterial(selected?.label || '');
    
  const hubBonus = pickupMode === 'dropoff' ? 20 : 0; // Extra KSh for dropping off
  const assetValue = Math.round(quantity * (liveRatePerKg + hubBonus));
  const netCost = Math.max(0, finalPrice - assetValue);

  const handleBook = async () => {
    setIsSubmitting(true);
    try {
      let photoUrl = null;
      if (photo && typeof photo !== 'string') photoUrl = await uploadFile('pickups', photo, profile?.id);
      const timeString = isManualTime ? `${customDate} @ ${customTime}` : (selectedTime?.time || 'ASAP');
      await createBooking({
        wasteType: selected.slug, bags: quantity, estate: pickupMode === 'dropoff' ? (selectedHub?.name || 'CleanFlow Hub') : customLocation.estate,
        latitude: pickupMode === 'dropoff' ? selectedHub?.lat : customLocation.latitude, 
        longitude: pickupMode === 'dropoff' ? selectedHub?.lng : customLocation.longitude,
        time: pickupMode === 'dropoff' ? 'Hub Drop-off' : timeString, 
        amount: finalPrice, photoUrl, agentId: selectedAgent?.id || null,
        notes: `M-PESA Express: ${paymentNumber} | Mode: ${pickupMode}`,
        bookingType: selectedTime?.type || 'any',
      });
      setShowEscrowModal(false);
      toast.success("Pickup Requested! 🚛");
      navigate('/my-bookings');
    } catch (err) {
      toast.error("Booking Failed", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const center = [customLocation.latitude || -1.2635, customLocation.longitude || 36.8048];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-32">
      
      {/* ── HEADER ── */}
      <div className="p-6 pt-8 flex items-center justify-between">
         <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-100"><ArrowLeft className="w-5 h-5 dark:text-white" /></button>
         <div className="flex flex-col items-end">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Step {step} of 3</h1>
            <div className="flex gap-1 mt-1">
               {[1, 2, 3].map(i => (<div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-2 bg-slate-200 dark:bg-slate-800'}`} />))}
            </div>
         </div>
      </div>

      <div className="px-6">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="p1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
               <div className="space-y-4">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">What are we picking up?</h2>
                  {!wasteType ? (
                    <div className="grid grid-cols-3 gap-3">
                        {categories.map((cat) => (
                          <button 
                            key={cat.id} 
                            onClick={() => {
                              setWasteType(cat);
                              setSelectedSubItem({ 
                                id: `cat-${cat.id}`, 
                                label: `${cat.label} (Mixed)`, 
                                price_per_unit: cat.id === 'recyclable' ? 15 : 0, 
                                unit: 'kg',
                                slug: cat.id
                              });
                            }} 
                            className="p-3 rounded-[24px] bg-white dark:bg-slate-800 border border-slate-100 flex flex-col items-center gap-2.5 active:scale-95 transition-all shadow-sm group hover:border-primary/30"
                          >
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center justify-center text-xl group-hover:bg-primary/5 transition-colors">
                              {cat.icon || '📦'}
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-tighter text-slate-900 dark:text-white text-center leading-tight">
                              {cat.label}
                            </span>
                          </button>
                        ))}
                     </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900/50 p-4 rounded-[28px] border border-primary/20 relative shadow-sm flex items-center gap-4">
                       <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-xl text-white">{wasteType.icon}</div>
                       <div className="flex-1">
                          <h3 className="text-xs font-black dark:text-white leading-none">{wasteType.label}</h3>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready for pickup</p>
                       </div>
                       <button onClick={() => { setWasteType(null); setSelectedSubItem(null); }} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[8px] font-black text-primary uppercase tracking-widest">Change</button>
                    </div>
                  )}
               </div>

               {wasteType && (
                 <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Estimated Quantity</h2>
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-100 flex items-center gap-8 shadow-sm">
                       <button onClick={() => setQuantity(Math.max(1, quantity - 5))} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-xl font-black dark:text-white">-</button>
                       <div className="flex-1 text-center">
                          <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{quantity}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">KG</p>
                       </div>
                       <button onClick={() => setQuantity(quantity + 5)} className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-xl font-black text-white shadow-lg">+</button>
                    </div>
                 </div>
               )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="p2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Collection Method</h2>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button 
                        onClick={() => setPickupMode('pickup')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${pickupMode === 'pickup' ? 'bg-primary text-white shadow-md' : 'text-slate-400'}`}
                      >
                        Pickup
                      </button>
                      <button 
                        onClick={() => { setPickupMode('dropoff'); setStep(2); }}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${pickupMode === 'dropoff' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400'}`}
                      >
                        Hub
                      </button>
                    </div>
                  </div>

                  <div className="h-[250px] w-full rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 relative shadow-sm group">
                     <MapContainer center={center} zoom={13} zoomControl={false} className="h-full w-full z-0">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <ChangeView center={center} />
                        <Marker position={center} icon={userIcon} />
                        
                        {pickupMode === 'pickup' ? (
                          liveAgents.map(agent => (
                            <Marker key={agent.id} position={[agent.location?.latitude || center[0], agent.location?.longitude || center[1]]} icon={agentIcon(selectedAgent?.id === agent.id)} eventHandlers={{ click: () => { setSelectedAgent(agent); toast.success(`Agent Targeted`, { icon: '🚛' }); }}}>
                               <Popup className="compact-popup"><div className="p-1 px-2 min-w-[80px] text-center"><h4 className="text-[10px] font-black text-slate-900 leading-tight">{agent.name || 'Agent'}</h4><div className="flex items-center justify-center gap-0.5 mt-0.5 text-[8px] font-bold text-emerald-500 uppercase"><Star className="w-2 h-2 fill-emerald-500" /><span>4.9</span></div></div></Popup>
                            </Marker>
                          ))
                        ) : (
                          HUBS.map(hub => (
                            <Marker key={hub.id} position={[hub.lat, hub.lng]} icon={hubIcon} eventHandlers={{ click: () => { setSelectedHub(hub); toast.success(`${hub.name} Selected`, { icon: '🏢' }); }}}>
                               <Popup className="compact-popup"><div className="p-3 text-center"><h4 className="text-xs font-black text-slate-900">{hub.name}</h4><p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">{hub.address}</p></div></Popup>
                            </Marker>
                          ))
                        )}
                     </MapContainer>
                  </div>
               </div>

               {pickupMode === 'pickup' ? (
                 aiSuggestions.length > 0 ? (
                  <div className="space-y-3">
                     {/* SMART ASAP BUTTON */}
                     <button 
                       onClick={() => { selectTime(aiSuggestions[0]); setIsManualTime(false); }} 
                       className={`w-full p-6 rounded-[2rem] border-2 transition-all text-left flex items-center gap-4 ${!isManualTime && selectedTime?.time === 'ASAP' ? 'bg-primary border-primary shadow-xl shadow-primary/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5'}`}
                     >
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${!isManualTime && selectedTime?.time === 'ASAP' ? 'bg-white/20' : 'bg-primary/10'}`}>
                         <Zap className={`w-7 h-7 ${!isManualTime && selectedTime?.time === 'ASAP' ? 'text-white' : 'text-primary'}`} />
                       </div>
                       <div className="flex-1">
                         <p className={`text-lg font-black leading-tight ${!isManualTime && selectedTime?.time === 'ASAP' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>ASAP</p>
                         <p className={`text-[11px] font-bold mt-0.5 ${!isManualTime && selectedTime?.time === 'ASAP' ? 'text-white/70' : 'text-slate-400'}`}>{aiSuggestions[0]?.label || 'Agents available'}</p>
                       </div>
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${!isManualTime && selectedTime?.time === 'ASAP' ? 'border-white bg-white' : 'border-slate-200'}`}>
                         {!isManualTime && selectedTime?.time === 'ASAP' && <div className="w-3 h-3 rounded-full bg-primary" />}
                       </div>
                     </button>

                     {/* SCHEDULE LATER */}
                     <button 
                       onClick={() => setIsManualTime(true)} 
                       className={`w-full p-5 rounded-[2rem] border-2 transition-all text-left flex items-center gap-4 ${isManualTime ? 'bg-slate-900 dark:bg-slate-700 border-slate-900 shadow-xl' : 'bg-white dark:bg-slate-800 border-dashed border-slate-200 dark:border-white/10'}`}
                     >
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isManualTime ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-900'}`}>
                         <Clock className={`w-6 h-6 ${isManualTime ? 'text-primary' : 'text-slate-400'}`} />
                       </div>
                       <div className="flex-1">
                         <p className={`text-sm font-black leading-tight ${isManualTime ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Schedule Later</p>
                         <p className={`text-[10px] font-bold mt-0.5 ${isManualTime ? 'text-white/50' : 'text-slate-400'}`}>Pick a date & time</p>
                       </div>
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isManualTime ? 'border-white bg-white' : 'border-slate-200'}`}>
                         {isManualTime && <div className="w-3 h-3 rounded-full bg-slate-900" />}
                       </div>
                     </button>
                  </div>
                 ) : (
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-8 rounded-[2.5rem] border border-orange-100 dark:border-orange-900/30 text-center space-y-3">
                     <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-2xl flex items-center justify-center mx-auto text-orange-500"><AlertCircle className="w-6 h-6" /></div>
                     <h3 className="text-sm font-black text-orange-900 dark:text-orange-200 uppercase tracking-widest">No Agents Online</h3>
                     <p className="text-[11px] font-bold text-orange-700/70 dark:text-orange-400/70 leading-relaxed">All agents are currently offline. You can schedule a pickup for later!</p>
                     <button onClick={() => setIsManualTime(true)} className="px-6 py-3 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">Schedule a Pickup</button>
                  </div>
                 )
               ) : (
                 <div className="space-y-3">
                    {selectedHub ? (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-4">
                         <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus className="w-8 h-8" /></div>
                         <div className="flex-1">
                            <h3 className="text-sm font-black dark:text-white">{selectedHub.name}</h3>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Bring your items here 🏢</p>
                         </div>
                         <button onClick={() => setSelectedHub(null)} className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 font-black text-[10px]">Change</button>
                      </div>
                    ) : (
                      <div className="p-8 border-2 border-dashed border-emerald-500/20 rounded-[2rem] text-center bg-emerald-50/10">
                         <MapPin className="w-10 h-10 text-emerald-500 mx-auto mb-3 animate-bounce-slow" />
                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Select a Hub on the map</p>
                      </div>
                    )}
                 </div>
               )}

               {isManualTime && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</span>
                       <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-xs font-black dark:text-white outline-none" />
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</span>
                       <input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-xs font-black dark:text-white outline-none" />
                    </div>
                 </motion.div>
               )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="p3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pb-6">
               <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Checkout Summary</h2>
               <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2EB44A]/10 rounded-xl flex items-center justify-center"><Smartphone className="w-5 h-5 text-[#2EB44A]" /></div>
                    <div><h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">M-PESA Express</h4><p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Confirm STK Push Number</p></div>
                  </div>
                  <input type="tel" value={paymentNumber} onChange={(e) => setPaymentNumber(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-base font-black border border-slate-100 dark:border-white/5 outline-none font-mono" />
               </div>
               <div className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Price Breakdown</p>
                  
                  {/* Processing Fee */}
                  <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-white/5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{selected?.label || 'Material'} Processing</span>
                      <span className="text-[10px] text-slate-400">KSh {selected?.price_per_unit || 0}/kg × {quantity} kg</span>
                    </div>
                    <span className="text-sm font-black text-slate-700 dark:text-white font-mono">KSh {Math.round(processingFee)}</span>
                  </div>

                  {/* Logistics Fee */}
                  <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-white/5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Logistics & Pickup</span>
                      <span className="text-[10px] text-slate-400">Agent transport fee</span>
                    </div>
                    <span className="text-sm font-black text-slate-700 dark:text-white font-mono">KSh {logisticsFee}</span>
                  </div>

                  {/* Minimum Fee Notice */}
                  {baseTotal < 100 && (
                    <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-white/5">
                      <span className="text-[10px] font-bold text-orange-500">Minimum pickup fee applied</span>
                      <span className="text-sm font-black text-orange-500 font-mono">KSh 100</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Collection Cost</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white font-mono">KSh {Math.round(finalPrice)}</span>
                  </div>
                </div>

                {/* Market Reward */}
                <div className="flex justify-between items-center p-5 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-20">
                     <TrendingUp className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex flex-col relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none">Your Material Value</span>
                       <div className="px-1.5 py-0.5 bg-white/20 rounded-md flex items-center gap-1 border border-white/10">
                          <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[7px] font-black text-white uppercase tracking-tighter">Live Oracle</span>
                       </div>
                    </div>
                    <span className="text-sm font-black text-white leading-none">KSh {liveRatePerKg}/kg Credit</span>
                  </div>
                  <span className="text-2xl font-black text-white font-mono relative z-10">- KSh {assetValue}</span>
                </div>

                {/* Net Cost */}
                <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[40px] text-white shadow-2xl space-y-2 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">What You Actually Pay</p>
                  <h3 className="text-5xl font-black tracking-tighter">KSh {Math.round(netCost)}</h3>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── INLINE ACTION BUTTON ── */}
        <div className="mt-8">
          <button
            disabled={isSubmitting || (step === 1 && !wasteType) || (step === 2 && pickupMode === 'pickup' && !selectedTime && !isManualTime) || (step === 2 && pickupMode === 'dropoff' && !selectedHub)}
            onClick={() => step < 3 ? setStep(step + 1) : setShowEscrowModal(true)}
            className="w-full p-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
          >
            <span>{step === 3 ? 'CONFIRM & PAY' : 'CONTINUE'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── ESCROW TRUST MODAL ── */}
      <AnimatePresence>
        {showEscrowModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEscrowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
             <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-8 pb-10 shadow-2xl overflow-hidden">
                <div className="relative space-y-6">
                   <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center"><Shield className="w-8 h-8 text-primary" /></div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Safe Escrow Payment</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">Your payment of <span className="font-black text-slate-900 dark:text-white">KSh {Math.round(finalPrice)}</span> will be held safely by CleanFlow and only released when the job is done.</p>
                   </div>
                   <button 
                     disabled={isSubmitting}
                     onClick={handleBook}
                     className="w-full p-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     {isSubmitting ? <span className="animate-pulse">PROCEEDING TO M-PESA...</span> : <><span>PAY & BOOK SAFELY</span><Smartphone className="w-4 h-4" /></>}
                   </button>
                   <button onClick={() => setShowEscrowModal(false)} className="w-full text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Go Back</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
