'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

// Fix for default marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to dynamically fit bounds to all markers
function ChangeView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [bounds, map]);
  return null;
}

export default function MapComponent({ events }) {
  const eventsWithCoords = events.filter(e => e.lat && e.lng);
  
  const defaultCenter = [39.8283, -98.5795]; // Center of US
  const defaultZoom = 4;

  const bounds = eventsWithCoords.map(e => [e.lat, e.lng]);

  return (
    <div className="h-[400px] sm:h-[500px] w-full rounded-2xl overflow-hidden shadow-sm border border-stone-sage-light/30 z-0 relative">
      <MapContainer 
        center={eventsWithCoords.length === 1 ? [eventsWithCoords[0].lat, eventsWithCoords[0].lng] : defaultCenter} 
        zoom={eventsWithCoords.length === 1 ? 13 : defaultZoom} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {eventsWithCoords.length > 1 && <ChangeView bounds={bounds} />}
        
        {eventsWithCoords.map(event => (
          <Marker key={event.id} position={[event.lat, event.lng]}>
            <Popup className="rounded-xl overflow-hidden">
              <div className="p-1">
                <div className={`inline-block px-2 py-1 font-bold text-[10px] uppercase tracking-widest rounded mb-1 ${
                  event.status === 'Ready' ? 'bg-stone-sage/10 text-stone-sage' : 'bg-stone-terracotta/10 text-stone-terracotta'
                }`}>
                  {event.status}
                </div>
                <h3 className="font-bold text-lg leading-tight mb-1">{event.stone}</h3>
                <p className="text-xs text-stone-text/70 mb-3">{event.event_date} @ {event.event_time}</p>
                <Link href={`/soup/${event.id}`} className="block w-full text-center bg-stone-sage text-white text-xs font-bold py-2 rounded shadow-sm hover:bg-stone-sage-dark transition-colors">
                  View Event
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
