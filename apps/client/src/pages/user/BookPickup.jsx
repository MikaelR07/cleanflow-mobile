/**
 * Book Pickup Page — Waste type selector, photo upload, AI times, voice assistant, pricing
 */
import { useState, useEffect } from 'react';
import { Sparkles, Clock, Mic, Camera, Check, ChevronRight, ArrowLeft, MapPin, Edit2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';
import { useBookingStore, useAuthStore } from '@cleanflow/core';
import { WASTE_TYPES, ESTATES, ESTATE_COORDINATES, AGENT_LOCATIONS, SUBSCRIPTION_TIERS } from '@cleanflow/core/src/data/mockData';
import { SkeletonCard } from '@cleanflow/ui/components/Skeletons';
import LocationSelector from '@cleanflow/ui/components/LocationSelector';

const MOCK_AGENTS = [
  { id: 1, name: "David Kimani", rating: 4.8, lat: -1.2951, lng: 36.8219, status: "Available" },
  { id: 2, name: "Sarah Ochieng", rating: 4.9, lat: -1.3021, lng: 36.8250, status: "Available" },
  { id: 3, name: "John Njoroge", rating: 4.6, lat: -1.2881, lng: 36.8160, status: "Busy" }
];

const customIcon = (color) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-8 h-8 rounded-[10px] bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-xs animate-bounce">⚡</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export default function BookPickup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuthStore();
  const { 
    bookings, aiSuggestions, isLoadingAI, selectedTime, selectTime, createBooking, updateBooking, openVoiceModal,
    liveAgents, fetchNearbyAgents, subscribeToAgents, cleanupAgents 
  } = useBookingStore();

  const [wasteType, setWasteType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customLocation, setCustomLocation] = useState(profile?.location || { estate: 'South B', latitude: null, longitude: null });
  const [photo, setPhoto] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [step, setStep] = useState(1); // 1: type, 2: details, 3: time, 4: confirm
  
  const [phone, setPhone] = useState(profile?.phone || '+254 712 345 678');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [rescheduleId, setRescheduleId] = useState(null);

  const formatManualTime = (date, time) => {
    if (!date || !time) return '';
    try {
      const d = new Date(`${date}T${time}`);
      return d.toLocaleString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch { return `${date} ${time}`; }
  };

  // Manual Time Selection State
  const [customDate, setCustomDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [customTime, setCustomTime] = useState(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
  const [isManual, setIsManual] = useState(false);

  // ── Agent Map Data & Sync ─────────────────────────────────────
  useEffect(() => {
    fetchNearbyAgents();
    subscribeToAgents();
    return () => cleanupAgents();
  }, [fetchNearbyAgents, subscribeToAgents, cleanupAgents]);

  // Handle Reschedule Mode
  useEffect(() => {
    if (location.state?.rescheduleId) {
      const b = bookings.find(item => item.id === location.state.rescheduleId);
      if (b) {
        setRescheduleId(b.id);
        setWasteType(b.wasteType);
        setQuantity(b.bags || 1);
        setEstate(b.estate);
        setStep(3); // Jump to time selection
      }
    }
  }, [location.state, bookings]);

  // ── NEW: Geolocation & Professional Pricing ──────────────────────
  const [userCoords, setUserCoords] = useState(null);
  const [distToAgent, setDistToAgent] = useState(1.5); // Default 1.5km for central hubs

  useEffect(() => {
    // Attempt live geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          calculateClosestAgentDistance({ lat: latitude, lng: longitude });
        },
        () => {
          // Fallback to estate coordinates
          const coords = ESTATE_COORDINATES[customLocation?.estate] || ESTATE_COORDINATES['Westlands'];
          setUserCoords(coords);
          calculateClosestAgentDistance(coords);
        }
      );
    }
  }, [customLocation?.estate]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateClosestAgentDistance = (coords) => {
    if (!coords) return;
    let minD = 999;
    AGENT_LOCATIONS.forEach(agent => {
      const d = calculateDistance(coords.lat, coords.lng, agent.lat, agent.lng);
      if (d < minD) minD = d;
    });
    setDistToAgent(parseFloat(minD.toFixed(2)));
  };

  const selected = WASTE_TYPES.find((w) => w.id === wasteType);
  
  // Dynamic Pricing Logic: Profit Guarantee Mode
  const KM_RATE = 40;
  const MIN_PICKUP_PRICE = 100;
  
  const logisticsFee = distToAgent * KM_RATE;
  const materialFee = selected ? (selected.price * quantity) : 0;
  
  // Total Price is the larger of (Material + Logistics) or the Minimum Floor
  const totalPrice = selected ? Math.max(materialFee + logisticsFee, MIN_PICKUP_PRICE) : 0;
  
  // Profit Floor (Internal Cost + Logistics + Safety Margin)
  const floorPrice = selected 
    ? (selected.minOperationalCost * quantity) + logisticsFee + 20 
    : 0;

  const discountedPrice = selectedTime 
    ? Math.max(Math.round(totalPrice * (1 - selectedTime.discount / 100)), floorPrice) 
    : totalPrice;

  const isIncluded = profile?.subscriptionTier === 'premium' || profile?.subscriptionTier === 'standard';
  const finalDisplayPrice = isIncluded ? 0 : discountedPrice;

  const handleBook = async () => {
    if (rescheduleId) {
      await updateBooking(rescheduleId, {
        time: selectedTime?.time || 'Next available',
        amount: discountedPrice,
        agent: selectedAgent?.name || null,
        phone: phone
      });
      toast.success(`Booking ${rescheduleId} Updated! 🎉`, {
        description: `Your pickup has been rescheduled to ${selectedTime?.time}`,
      });
    } else {
      const booking = await createBooking({
        wasteType,
        bags: quantity,
        estate: customLocation.estate,
        latitude: customLocation.latitude,
        longitude: customLocation.longitude,
        time: selectedTime?.time || 'Next available',
        amount: discountedPrice,
        agent: selectedAgent?.name || null,
        phone: phone
      });
      toast.success(`Booking ${booking.id} confirmed! 🎉`, {
        description: `${selected.label} pickup in ${customLocation.estate}`,
      });
    }
    navigate('/my-bookings');
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-950 dark:text-white">Book Pickup</h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Step {step} of 4</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-slate-200'}`} />
        ))}
      </div>

      {/* Step 1: Waste Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold">What type of waste?</h2>
          <div className="grid grid-cols-2 gap-3">
            {WASTE_TYPES.map((w) => (
              <button
                key={w.id}
                id={`waste-${w.id}`}
                onClick={() => setWasteType(w.id)}
                className={`card text-left p-5 border-2 transition-all ${
                  wasteType === w.id ? 'border-primary bg-primary/5 ring-4 ring-primary/5 scale-[1.02]' : 'border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl mb-2 shadow-inner">
                  {w.icon}
                </div>
                <p className="font-extrabold text-xs dark:text-slate-100">{w.label}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">KSh {w.price}/{w.unit}</p>
                {wasteType === w.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <button
            disabled={!wasteType}
            onClick={() => setStep(2)}
            className="btn-primary w-full p-4 text-base rounded-2xl disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2 group"
          >
            <span className="font-bold">Continue</span>
            <ChevronRight className="w-5 h-5 group-active:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-semibold">Pickup Details</h2>

          {/* Estate */}
          <div>
            <LocationSelector 
                value={customLocation} 
                onChange={setCustomLocation} 
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block ml-1 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              {selected?.unit === 'kg' ? 'Estimated Weight' : `Number of ${selected?.unit || 'items'}`}
            </label>
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xl font-black text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-black dark:text-white">
                  {quantity} {selected?.unit === 'kg' ? 'kg' : ''}
                </span>
              </div>
              <button 
                onClick={() => setQuantity(quantity + 1)} 
                className="w-11 h-11 rounded-full bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center text-xl font-black active:scale-95 transition-all"
              >
                +
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-bold italic mt-2 px-1 leading-tight">
              Note: Final rewards are calculated based on the official Agent Vehicle Scale measurement at pickup.
            </p>
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Photo (optional)</label>
            <label className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
              {photo ? (
                <img src={photo} alt="Waste" className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-slate-300" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{photo ? 'Photo added' : 'Tap to add photo'}</p>
                <p className="text-xs text-slate-400">Helps agent prepare the right vehicle</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>

          {/* Price Estimate */}
          <div className="relative overflow-hidden card bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 p-4 border-0 shadow-2xl shadow-primary/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 mb-1">Estimated Price</p>
                <p className="text-xs text-slate-400 font-medium">Final total in step 4</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white font-mono tracking-tighter">KSh {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button onClick={() => setStep(3)} className="btn-primary w-full p-4 text-base rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 group">
            <span className="font-bold">Choose Time</span>
            <ChevronRight className="w-5 h-5 group-active:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Step 3: Time Selection (AI Suggested) */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-extrabold text-slate-900 dark:text-white">Choose Pickup Time</h2>
            <div className="flex items-center gap-1 text-[9px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full ring-1 ring-primary/20">
              <Sparkles className="w-2.5 h-2.5" /> AI OPTIMIZED
            </div>
          </div>

          {isLoadingAI ? (
            <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
          ) : (
            <div className="space-y-3">
              {aiSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    selectTime(s);
                    setIsManual(false);
                  }}
                  className={`w-full text-left card p-5 border-2 transition-all ${
                    !isManual && selectedTime?.time === s.time
                      ? 'border-primary bg-primary/5 ring-4 ring-primary/5'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${!isManual && selectedTime?.time === s.time ? 'text-primary' : 'text-slate-400'}`} />
                      <span className="font-extrabold text-[15px] dark:text-slate-100">{s.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isManual && selectedTime?.time === s.time && <Check className="w-5 h-5 text-primary" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{s.reason}</p>
                </button>
              ))}

              {/* Manual Selection Overlay/Block */}
              <div className={`w-full card transition-all border-2 overflow-hidden ${isManual ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-slate-100 dark:border-slate-800'}`}>
                <button 
                  onClick={() => {
                    setIsManual(true);
                    const t = formatManualTime(customDate, customTime);
                    selectTime({ time: t, discount: 0, isAI: false, reason: 'Custom selected slot' });
                  }}
                  className="w-full text-left p-5 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isManual ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Edit2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-[15px] dark:text-slate-100 block">Pick Custom Slot</span>
                      <span className="text-[10px] text-slate-400 font-medium italic">Standard rates apply</span>
                    </div>
                  </div>
                  {isManual && <Check className="w-5 h-5 text-primary" />}
                </button>
                
                {isManual && (
                  <div className="px-5 pb-5 space-y-4 animate-slide-up">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-1.5 block ml-1">Date</label>
                        <input 
                          type="date" 
                          value={customDate}
                          onChange={(e) => {
                            setCustomDate(e.target.value);
                            const t = formatManualTime(e.target.value, customTime);
                            selectTime({ time: t, discount: 0, isAI: false, reason: 'Custom selected slot' });
                          }}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-1.5 block ml-1">Time</label>
                        <input 
                          type="time" 
                          value={customTime}
                          onChange={(e) => {
                            setCustomTime(e.target.value);
                            const t = formatManualTime(customDate, e.target.value);
                            selectTime({ time: t, discount: 0, isAI: false, reason: 'Custom selected slot' });
                          }}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none" 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            disabled={!selectedTime}
            onClick={() => setStep(4)}
            className="btn-primary w-full p-4 text-base rounded-2xl disabled:opacity-30 transition-all font-bold uppercase tracking-wider flex items-center justify-center gap-2 group"
          >
            <span>Review Booking</span>
            <ChevronRight className="w-5 h-5 group-active:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="font-semibold">Confirm Booking</h2>

          <div className="card p-6 space-y-3 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Waste Type</span>
              <span className="text-sm font-extrabold dark:text-white">{selected?.icon} {selected?.label}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Quantity</span>
              <span className="text-sm font-extrabold dark:text-white">{quantity} {selected?.unit}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Location</span>
              <span className="text-sm font-extrabold dark:text-white">{customLocation?.estate}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Distance</span>
              <span className="text-sm font-extrabold dark:text-white">{distToAgent} km</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Logistics Fee</span>
              <span className="text-sm font-extrabold dark:text-white">KSh {logisticsFee.toLocaleString()}</span>
            </div>
            {selectedTime?.discount > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[11px] font-black uppercase tracking-widest text-orange-500">AI Community Discount</span>
                <span className="text-sm font-extrabold text-orange-500">-{selectedTime.discount}%</span>
              </div>
            )}
            {selected?.unit === 'kg' && (
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/20 px-1 rounded-md">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Est. Recycling Reward</span>
                <span className="text-sm font-extrabold text-emerald-600">− KSh {(quantity * 5).toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-3">
              <div>
                <span className="font-black text-lg dark:text-white uppercase tracking-widest text-slate-700">Net Cost</span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter -mt-1">Effective after rewards</p>
              </div>
              <div className="text-right">
                {isIncluded ? (
                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-primary font-mono ml-2 uppercase text-right">Free</span>
                    <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-widest mt-1 text-right">
                      Sponsorship: {SUBSCRIPTION_TIERS[profile?.subscriptionTier]?.label || 'Standard'}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-primary font-mono ml-2">KSh {Math.max(0, discountedPrice - (selected?.unit === 'kg' ? quantity * 5 : 0)).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 line-through font-bold">Total: KSh {discountedPrice.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-1">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic flex items-center gap-1.5 leading-none">
              <Sparkles className="w-2.5 h-2.5 text-primary" /> Scale Verified Pricing
            </p>
            <p className="text-[8px] text-slate-400 font-medium leading-tight mt-1 opacity-80">
              Final rewards and pricing will be adjusted based on the official Agent Vehicle Scale measurement at pickup.
            </p>
          </div>

          {/* Payment Method */}
          <div className="card p-4 hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-lg font-black shadow-lg shadow-primary/20">M</div>
              <div className="flex-1">
                <p className="text-sm font-extrabold dark:text-white uppercase tracking-wider">M-Pesa Express</p>
                {isEditingPhone ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      autoFocus
                      type="text" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 text-xs font-bold p-1 rounded outline-none border border-primary/30 w-full"
                    />
                    <button onClick={() => setIsEditingPhone(false)} className="text-[10px] font-black text-primary uppercase">Save</button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium tracking-tight">{phone}</p>
                )}
              </div>
              {!isEditingPhone && (
                <button 
                  onClick={() => setIsEditingPhone(true)}
                  className="flex items-center gap-1 text-[10px] font-black text-primary px-2 py-1 bg-primary/10 rounded-full hover:bg-primary hover:text-white transition-all"
                >
                  <Edit2 className="w-2.5 h-2.5" /> CHANGE
                </button>
              )}
            </div>
          </div>

          {/* Live Agents Map Section */}
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Live Agents Near You
            </h3>
            <p className="text-xs text-slate-500">Tap on an agent on the map to choose them for your pickup.</p>
            
            <div className="h-40 w-full rounded-xl overflow-hidden shadow-inner border border-slate-200 z-0">
              <MapContainer 
                center={customLocation?.latitude ? [customLocation.latitude, customLocation.longitude] : [-1.2951, 36.8219]} 
                zoom={14} 
                scrollWheelZoom={true} 
                zoomControl={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* User Domicile Pin */}
                {customLocation?.latitude && (
                  <Marker 
                    position={[customLocation.latitude, customLocation.longitude]} 
                    icon={L.divIcon({
                      className: 'custom-div-icon',
                      html: `<div style="background-color: #00A651; width: 32px; height: 32px; border-radius: 12px; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2); display: flex; items-center; justify-content: center; font-size: 16px;">👤</div>`,
                      iconSize: [32, 32],
                      iconAnchor: [16, 16]
                    })}
                  >
                    <Popup>
                      <div className="text-center font-bold text-xs uppercase tracking-widest text-primary">Your Location</div>
                    </Popup>
                  </Marker>
                )}

                {liveAgents.map((agent) => {
                  const lat = agent.location?.latitude || -1.2951;
                  const lng = agent.location?.longitude || 36.8219;
                  
                  return (
                    <Marker 
                      key={agent.id} 
                      position={[lat, lng]}
                      icon={customIcon(selectedAgent?.id === agent.id ? '#0ea5e9' : '#3b82f6')}
                      eventHandlers={{
                        click: () => {
                          setSelectedAgent(agent);
                          toast.success(`${agent.name} Selected!`, { 
                            description: agent.rating ? `Rating: ${agent.rating.toFixed(1)} ⭐` : 'New Agent — First Pickup!' 
                          });
                        },
                      }}
                    >
                      <Popup>
                        <div className="text-center pb-1">
                          <p className="font-bold text-sm">{agent.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                            {agent.rating ? `⭐ ${agent.rating.toFixed(1)}` : 'New Agent'} | Online
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
            
            {selectedAgent && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Selected Agent</p>
                  <p className="text-sm font-bold text-slate-800">{selectedAgent.name}</p>
                </div>
                <button onClick={() => setSelectedAgent(null)} className="text-xs font-semibold text-primary">Clear</button>
              </div>
            )}
          </div>

          <button id="confirm-booking" onClick={handleBook} className="btn-primary w-full p-4 text-base rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">
            Confirm & Pay KSh {totalPrice.toLocaleString()}
          </button>
        </div>
      )}

      {/* Voice Booking FAB */}
      <button
        onClick={openVoiceModal}
        className="fixed bottom-20 right-4 w-14 h-14 bg-secondary text-white rounded-full shadow-lg shadow-secondary/30 flex items-center justify-center hover:scale-105 transition-transform z-40 lg:bottom-6"
      >
        <Mic className="w-6 h-6" />
      </button>
    </div>
  );
}
