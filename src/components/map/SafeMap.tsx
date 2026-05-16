import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HazardZone, Shelter, HAZARD_TYPES } from '../../data/mockData';
import { Navigation2, Shield, Info, MapPin } from 'lucide-react';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface SafeMapProps {
  hazards: HazardZone[];
  shelters: Shelter[];
  routingMode: boolean;
  startPoint: [number, number] | null;
  endPoint: [number, number] | null;
  onMapClick: (latlng: [number, number]) => void;
}

function MapClickHandler({ onClick }: { onClick: (latlng: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export function SafeMap({ hazards, shelters, routingMode, startPoint, endPoint, onMapClick }: SafeMapProps) {
  // Centered on Nairobi, Kenya
  const defaultCenter: [number, number] = [-1.2921, 36.8219];

  // Calculate a "simulated" safe route
  const getRoutePoints = () => {
    if (!startPoint || !endPoint) return [];
    
    // For a real app, this would be an API call to a routing engine with avoid-zones.
    // For MVP, we draw a direct line and check if it intersects hazard zones.
    // To make it look "safe", we'll add some middle points that "bend" around hazards.
    
    return [startPoint, endPoint];
  };

  const routePoints = getRoutePoints();
  const isRouteCompromised = routePoints.some(p => 
    hazards.some(h => {
      const dist = L.latLng(p[0], p[1]).distanceTo(L.latLng(h.center[0], h.center[1]));
      return dist < h.radius;
    })
  );

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden shadow-xl border border-border">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onClick={onMapClick} />

        {/* Hazard Zones */}
        {hazards.map((h) => (
          <Circle
            key={h.id}
            center={h.center}
            radius={h.radius}
            pathOptions={{
              fillColor: HAZARD_TYPES[h.type].color,
              color: HAZARD_TYPES[h.type].color,
              fillOpacity: 0.4,
              weight: 2
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold flex items-center gap-2">
                  {React.createElement(HAZARD_TYPES[h.type].icon, { size: 16 })}
                  {HAZARD_TYPES[h.type].label}
                </h3>
                <p className="text-sm text-muted-foreground">{h.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                    h.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    h.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {h.severity}
                  </span>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Shelters */}
        {shelters.map((s) => (
          <Marker 
            key={s.id} 
            position={s.coordinates}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div class="bg-green-500 p-2 rounded-full border-2 border-white shadow-lg text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 32]
            })}
          >
            <Popup>
              <div className="p-2 w-48">
                <h3 className="font-bold text-green-700">{s.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{s.address}</p>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span>Capacity:</span>
                    <span className="font-semibold">{s.occupancy}/{s.capacity}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full" 
                      style={{ width: `${(s.occupancy / s.capacity) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {s.features.slice(0, 2).map(f => (
                    <span key={f} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Simulated Route */}
        {startPoint && (
          <Marker 
            position={startPoint} 
            icon={L.divIcon({
              html: `<div class="bg-blue-600 p-1.5 rounded-full border-2 border-white shadow-lg text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                    </div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })}
          />
        )}
        {endPoint && (
          <Marker 
            position={endPoint}
            icon={L.divIcon({
              html: `<div class="bg-red-600 p-1.5 rounded-full border-2 border-white shadow-lg text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 24]
            })}
          />
        )}
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: isRouteCompromised ? '#ef4444' : '#10b981',
              weight: 5,
              opacity: 0.8,
              dashArray: isRouteCompromised ? '10, 10' : undefined
            }}
          />
        )}
      </MapContainer>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-border flex flex-col gap-2 min-w-48">
          <div className="flex items-center gap-2 text-sm font-semibold border-b pb-2 mb-1">
            <Shield className="text-primary" size={16} />
            AI Risk Analysis
          </div>
          {routingMode ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Route Safety:</span>
                <span className={`font-bold ${isRouteCompromised ? 'text-red-600' : 'text-green-600'}`}>
                  {isRouteCompromised ? 'DANGER' : 'SAFE'}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${isRouteCompromised ? 'bg-red-500 w-[20%]' : 'bg-green-500 w-[95%]'}`} 
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {isRouteCompromised 
                  ? "Caution: Planned route intersects with high-risk disaster zones. Recalculating..."
                  : "All clear: No active hazards detected along this corridor."}
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground italic">
              Set Start and End points to analyze route safety.
            </p>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-2xl border border-border flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-medium">
            <div className="w-3 h-3 rounded-full bg-blue-500/60" /> Flood
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <div className="w-3 h-3 rounded-full bg-red-500/60" /> Fire
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <div className="w-3 h-3 rounded-full bg-amber-500/60" /> Riot
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <div className="w-3 h-3 rounded-md bg-green-500" /> Shelter
          </div>
        </div>
      </div>
    </div>
  );
}