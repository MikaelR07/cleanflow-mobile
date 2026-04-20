/**
 * Navigate Job Page — Real-time tracking and mission control for agents
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Phone, Navigation, CheckCircle, User, Zap, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAgentStore, useAuthStore, useNotificationStore, NOTIFICATION_TYPES } from '@cleanflow/core';
import { toast } from 'sonner';

// Custom Icons
const agentIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-8 h-8 rounded-[10px] bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-xs animate-bounce">⚡</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const clientIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-8 h-8 bg-emerald-500 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white">👤</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export default function NavigateJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { activeJobs, fetchActiveJobs } = useAgentStore();
  const { addNotification } = useNotificationStore();
  
  const job = activeJobs.find(j => j.id === id);

  useEffect(() => {
    if (activeJobs.length === 0) fetchActiveJobs();
  }, [fetchActiveJobs, activeJobs.length]);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Navigation className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-xl font-bold dark:text-white">Mission Data Loading...</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-[200px]">Locating coordinates and mission parameters.</p>
        <button onClick={() => navigate('/jobs')} className="mt-8 btn-primary px-8">Back to Dispatch</button>
      </div>
    );
  }

  // Fallback to default Nairobi coords if missing
  const agentPos = profile?.location?.latitude ? [profile.location.latitude, profile.location.longitude] : [-1.2921, 36.8219];
  const clientPos = job.latitude ? [job.latitude, job.longitude] : [-1.2851, 36.8119];

  return (
    <div className="h-[calc(100dvh-120px)] flex flex-col -mx-4 -mt-5">
      {/* Top Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl pointer-events-auto border border-slate-200 dark:border-slate-800 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>

        <div className="p-2 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-lg pointer-events-auto border border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="flex flex-col text-right">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Target</span>
            <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase">{job.location}</span>
          </div>
          <MapPin className="w-3.5 h-3.5 text-primary" />
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 w-full bg-slate-100 grayscale-[0.2] contrast-[1.1]">
        <MapContainer 
          center={clientPos} 
          zoom={14} 
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          <Marker position={agentPos} icon={agentIcon}>
            <Popup>You are here</Popup>
          </Marker>

          <Marker position={clientPos} icon={clientIcon}>
            <Popup>
               <div className="text-center font-bold">{job.customerName?.split(' ')[0] || 'Client'}</div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Mission Control Panel */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[1000] rounded-t-[2.5rem] -mt-8 animate-slide-up">
        <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-6" />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-primary border border-emerald-100 dark:border-emerald-800">
               <User className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pick-up From</p>
              <h3 className="text-lg font-black dark:text-white leading-tight">{job.customerName?.split(' ')[0] || 'Client'}</h3>
              <p className="text-xs text-slate-500 font-bold">{job.location} · {job.material}</p>
            </div>
          </div>
          
          <button 
            onClick={() => window.location.href = `tel:${job.phone || '+254700000000'}`}
            className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-95 transition-all border border-slate-200 dark:border-slate-700"
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6 font-bold text-xs uppercase tracking-widest">
           <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3">
              <Clock className="w-4 h-4 text-accent" />
              <div className="flex flex-col">
                 <span className="text-[8px] text-slate-400">Scheduled Time Slot</span>
                 <span className="dark:text-white leading-none mt-0.5">{job.time}</span>
              </div>
           </div>
        </div>

        <button 
          onClick={() => {
            // Send notification to the user
            addNotification(
              "Agent Arrived! 🚚",
              `${profile.name} has arrived at your location. Please meet them to begin the pickup.`,
              NOTIFICATION_TYPES.SUCCESS,
              'client',
              job.user_id || job.userId
            );
            
            navigate('/jobs');
            toast.success("Welcome to Mission Site!", { description: "Please weigh the waste to complete pickup." });
          }}
          className="w-full py-4 bg-primary text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all group"
        >
          <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
          I HAVE ARRIVED AT LOCATION
        </button>
      </div>
    </div>
  );
}
