/**
 * My Routes Page — Leaflet map showing accepted and available jobs
 */
import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import { useAgentStore } from '@cleanflow/core';
import { WASTE_TYPES } from '@cleanflow/core/src/data/mockData';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/* Fix for default Leaflet markers */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const agentIcon = new L.DivIcon({
  className: '',
  html: '<div style="background:#00A651;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">📍</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const jobIcon = new L.DivIcon({
  className: '',
  html: '<div style="background:#FF6B00;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;">🗑️</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function MyRoutes() {
  const { availableJobs, acceptedJobs } = useAgentStore();
  const allJobs = useMemo(() => [...acceptedJobs, ...availableJobs], [acceptedJobs, availableJobs]);
  const center = [-1.2921, 36.8219]; // Nairobi

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold">My Routes</h1>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary" /> Your Location</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-accent" /> Pickup Points</span>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: '55vh' }}>
        <MapContainer center={center} zoom={13} className="w-full h-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Agent position */}
          <Marker position={[-1.2850, 36.8400]} icon={agentIcon}>
            <Popup>📍 Your Location<br/>Currently in Eastleigh</Popup>
          </Marker>
          {/* Job markers */}
          {allJobs.filter(j => j.lat && j.lng).map((job) => {
            const waste = WASTE_TYPES.find((w) => w.id === job.wasteType);
            return (
              <Marker key={job.id} position={[job.lat, job.lng]} icon={jobIcon}>
                <Popup>
                  <strong>{waste?.label}</strong><br/>
                  {job.estate} · {job.customer}<br/>
                  <span style={{ color: '#00A651', fontWeight: 600 }}>KSh {job.pay}</span>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Active Jobs */}
      {acceptedJobs.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-sm mb-3">Accepted Jobs ({acceptedJobs.length})</h3>
          {acceptedJobs.map((job) => {
            const waste = WASTE_TYPES.find((w) => w.id === job.wasteType);
            return (
              <div key={job.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span>{waste?.icon}</span>
                  <span className="text-sm font-medium">{job.estate}</span>
                </div>
                <span className="text-sm font-bold text-primary">KSh {job.pay}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
