/**
 * Route Optimizer — Smart Pathfinding for CleanFlow Agents
 */
import { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { 
  ArrowLeft, 
  Navigation, 
  Zap, 
  MapPin, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  Truck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAgentStore, useAuthStore } from '@cleanflow/core';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* Fix for default Leaflet markers */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom Premium Markers
const agentIcon = new L.DivIcon({
  className: '',
  html: '<div style="background:#00A651;width:32px;height:32px;border-radius:50%;border:4px solid white;box-shadow:0 4px 12px rgba(0,166,81,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;animation: pulse 2s infinite;">📍</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const jobIcon = new L.DivIcon({
  className: '',
  html: '<div style="background:#4F46E5;width:28px;height:28px;border-radius:50%;border:4px solid white;box-shadow:0 4px 12px rgba(79,70,229,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">♻️</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Helper component to recenter map
function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 14);
  }, [coords, map]);
  return null;
}

export default function MyRoutes() {
  const navigate = useNavigate();
  const { activeJobs, fetchActiveJobs } = useAgentStore();
  const { profile } = useAuthStore();
  const [currentPos, setCurrentPos] = useState([-1.2921, 36.8219]); // Nairobi Default
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedPath, setOptimizedPath] = useState(null);

  useEffect(() => {
    fetchActiveJobs();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentPos([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.warn('Geolocation failed:', err)
      );
    }
  }, []);

  // Simple optimization: Order jobs by proximity to currentPos
  const calculateOptimizedRoute = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const sortedJobs = [...activeJobs]
        .filter(j => j.latitude && j.longitude)
        .sort((a, b) => {
          const distA = Math.sqrt(Math.pow(a.latitude - currentPos[0], 2) + Math.pow(a.longitude - currentPos[1], 2));
          const distB = Math.sqrt(Math.pow(b.latitude - currentPos[0], 2) + Math.pow(b.longitude - currentPos[1], 2));
          return distA - distB;
        });

      const path = [currentPos, ...sortedJobs.map(j => [j.latitude, j.longitude])];
      setOptimizedPath(path);
      setIsOptimizing(false);
    }, 1500);
  };

  const totalPay = activeJobs.reduce((sum, j) => sum + (j.pay || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10 bg-slate-50 dark:bg-slate-950 min-h-screen p-4 pt-6">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Route Optimizer</h1>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest">Smart Dispatcher</p>
          </div>
        </div>
        <button 
          onClick={() => setOptimizedPath(null)}
          className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <RotateCcw className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* ── MAP CONTAINER ── */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[2.5rem] blur opacity-30"></div>
        <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl h-[45vh]">
          <MapContainer center={currentPos} zoom={13} className="w-full h-full" zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapRecenter coords={currentPos} />
            
            {/* Agent Location */}
            <Marker position={currentPos} icon={agentIcon}>
              <Popup className="font-bold">You are here</Popup>
            </Marker>

            {/* Active Job Markers */}
            {activeJobs.filter(j => j.latitude && j.longitude).map((job) => (
              <Marker key={job.id} position={[job.latitude, job.longitude]} icon={jobIcon}>
                <Popup>
                  <div className="p-1">
                    <p className="font-black text-xs uppercase text-slate-400 mb-1">{job.material} Pickup</p>
                    <p className="font-bold text-sm text-slate-900">{job.location}</p>
                    <p className="text-[10px] font-bold text-primary mt-1">KSh {job.pay?.toLocaleString()}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* The Optimized Path Line */}
            {optimizedPath && (
              <Polyline 
                positions={optimizedPath} 
                color="#00A651" 
                weight={4} 
                opacity={0.6} 
                dashArray="10, 10"
                className="animate-pulse"
              />
            )}
          </MapContainer>

          {/* Floating Actions */}
          {!optimizedPath && activeJobs.length > 0 && (
            <div className="absolute bottom-6 left-6 right-6 z-[1000]">
              <button 
                onClick={calculateOptimizedRoute}
                disabled={isOptimizing}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                {isOptimizing ? (
                  <>Calculating Smart Path... <Loader2 className="w-4 h-4 animate-spin" /></>
                ) : (
                  <>Optimize My Trip <Sparkles className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MISSION SUMMARY ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payload</p>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <p className="text-xl font-black text-slate-900 dark:text-white">{activeJobs.length} Stops</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Trip Value</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <p className="text-xl font-black text-slate-900 dark:text-white">KSh {totalPay}</p>
          </div>
        </div>
      </div>

      {/* ── ACTIVE STOP LIST ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Optimized Stop Order</h3>
          <Navigation className="w-4 h-4 text-slate-300" />
        </div>

        <div className="space-y-6">
          {activeJobs.length > 0 ? (
            activeJobs.map((job, i) => (
              <div key={job.id} className="flex items-start gap-4 relative">
                {i < activeJobs.length - 1 && (
                  <div className="absolute left-[19px] top-10 w-[2px] h-10 bg-slate-100 dark:bg-slate-800" />
                )}
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-primary border border-slate-100 dark:border-slate-700 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{job.location}</p>
                    <p className="text-[10px] font-black text-primary">KSh {job.pay}</p>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{job.material} Pickup · {job.time}</p>
                </div>
                <button 
                  onClick={() => navigate(`/jobs/navigate/${job.id}`)}
                  className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                No active missions.<br/>Accept some jobs first!
              </p>
              <button 
                onClick={() => navigate('/jobs')}
                className="mt-6 px-6 py-3 bg-primary/10 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest"
              >
                Go to Work Board
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add simple pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(0, 166, 81, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(0, 166, 81, 0); }
    100% { box-shadow: 0 0 0 0 rgba(0, 166, 81, 0); }
  }
`;
document.head.appendChild(style);
