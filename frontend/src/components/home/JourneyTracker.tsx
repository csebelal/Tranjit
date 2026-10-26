'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, AlertTriangle } from 'lucide-react';
import { STOP_COORDS } from '@/data/stopCoords';

interface Props {
  from: string;
  to: string;
  routeStops: string[];
  onClose: () => void;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocodeStop(stopName: string): Promise<[number, number] | null> {
  // Instant local lookup — no API call for known stops
  if (STOP_COORDS[stopName]) return STOP_COORDS[stopName];
  // Nominatim fallback for unknown stops
  try {
    const q = encodeURIComponent(`${stopName} Dhaka Bangladesh`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data: { lat: string; lon: string }[] = await res.json();
    if (data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
}

async function fetchOsrmRoute(coords: ([number, number] | null)[]): Promise<[number, number][] | null> {
  const valid = coords.filter((c): c is [number, number] => c !== null);
  if (valid.length < 2) return null;
  const waypoints = valid.map(([lat, lon]) => `${lon},${lat}`).join(';');
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${waypoints}?geometries=geojson&overview=full`
    );
    const data = await res.json();
    if (data.routes?.[0]?.geometry?.coordinates) {
      return data.routes[0].geometry.coordinates.map(
        ([lon, lat]: [number, number]) => [lat, lon] as [number, number]
      );
    }
  } catch {}
  return null;
}

function MapFollower({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(pos, map.getZoom());
  }, [pos, map]);
  return null;
}

const DHAKA_CENTER: [number, number] = [23.8103, 90.4125];
const NOMINATIM_DELAY_MS = 1200;

export default function JourneyTracker({ from, to, routeStops, onClose }: Props) {
  const stops = routeStops.length >= 2 ? routeStops : [from, to];

  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [stopCoords, setStopCoords] = useState<([number, number] | null)[]>(() =>
    new Array(stops.length).fill(null)
  );
  const [roadRoute, setRoadRoute] = useState<[number, number][] | null>(null);
  const [distToDestM, setDistToDestM] = useState<number | null>(null);
  const [arrived, setArrived] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [nearestStopIdx, setNearestStopIdx] = useState(0);

  const toCoordRef = useRef<[number, number] | null>(null);
  const stopCoordsRef = useRef<([number, number] | null)[]>([]);
  const vibrated = useRef(false);
  const watchId = useRef<number | null>(null);

  const fromCoord = stopCoords[0] ?? null;
  const toCoord = stopCoords[stops.length - 1] ?? null;

  useEffect(() => { toCoordRef.current = toCoord; }, [toCoord]);
  useEffect(() => { stopCoordsRef.current = stopCoords; }, [stopCoords]);

  // Geocode all stops: from+to parallel first, then intermediates (skip delay for hardcoded stops)
  useEffect(() => {
    const snapshot = [...stops];
    let cancelled = false;
    const coords: ([number, number] | null)[] = new Array(snapshot.length).fill(null);
    setStopCoords([...coords]);
    setRoadRoute(null);
    setMapLoading(true);

    (async () => {
      const [fc, tc] = await Promise.all([
        geocodeStop(snapshot[0]),
        geocodeStop(snapshot[snapshot.length - 1]),
      ]);
      if (cancelled) return;

      coords[0] = fc ?? null;
      coords[snapshot.length - 1] = tc ?? null;
      if (tc) toCoordRef.current = tc;
      setStopCoords([...coords]);
      setMapLoading(false);

      // Geocode intermediate stops
      for (let i = 1; i < snapshot.length - 1; i++) {
        if (cancelled) break;
        // Only rate-limit for Nominatim calls (unknown stops)
        if (!STOP_COORDS[snapshot[i]]) {
          await new Promise<void>(r => setTimeout(r, NOMINATIM_DELAY_MS));
        }
        if (cancelled) break;
        const coord = await geocodeStop(snapshot[i]);
        if (cancelled) break;
        coords[i] = coord ?? null;
        setStopCoords([...coords]);
      }

      // Fetch road-following route via OSRM after all stops resolved
      if (!cancelled) {
        const route = await fetchOsrmRoute(coords);
        if (!cancelled && route) setRoadRoute(route);
      }
    })();

    return () => { cancelled = true; };
  }, [from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  // GPS watch — starts once, never restarts
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('আপনার ডিভাইস GPS সাপোর্ট করে না');
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        setGeoError(null);
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setUserPos([lat, lon]);

        const dest = toCoordRef.current;
        if (dest) {
          const distKm = haversineKm(lat, lon, dest[0], dest[1]);
          const distM = Math.round(distKm * 1000);
          setDistToDestM(distM);

          if (distM <= 500 && !vibrated.current) {
            vibrated.current = true;
            setArrived(true);
            if ('vibrate' in navigator) navigator.vibrate([600, 200, 600, 200, 600]);
          }
        }

        // Find nearest stop for "পরবর্তী স্টপ" indicator
        const currentCoords = stopCoordsRef.current;
        let nearestIdx = 0;
        let minDist = Infinity;
        for (let i = 0; i < currentCoords.length; i++) {
          const c = currentCoords[i];
          if (!c) continue;
          const d = haversineKm(lat, lon, c[0], c[1]);
          if (d < minDist) { minDist = d; nearestIdx = i; }
        }
        setNearestStopIdx(nearestIdx);
      },
      (err) => {
        setUserPos((prev) => {
          if (prev !== null) return prev; // ignore transient errors after first fix
          if (err.code === 1) {
            setGeoError('লোকেশন অনুমতি দিন — ব্রাউজার বা ফোনের সেটিংস থেকে Location চালু করুন');
          } else {
            setGeoError('GPS সিগন্যাল পাওয়া যাচ্ছে না — খোলা জায়গায় যান বা একটু অপেক্ষা করুন');
          }
          return null;
        });
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 }
    );

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  const fromIcon = L.divIcon({
    className: '',
    html: '<div style="width:16px;height:16px;background:#16a34a;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const toIcon = L.divIcon({
    className: '',
    html: '<div style="width:22px;height:22px;background:#dc2626;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:11px">🏁</div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

  const midIcon = L.divIcon({
    className: '',
    html: '<div style="width:9px;height:9px;background:#94a3b8;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>',
    iconSize: [9, 9],
    iconAnchor: [4, 4],
  });

  const mapCenter: [number, number] = userPos ?? fromCoord ?? DHAKA_CENTER;
  const formatDist = (m: number) =>
    m >= 1000 ? `${(m / 1000).toFixed(1)} কিমি` : `${m} মিটার`;

  // Straight-line fallback polyline (until OSRM loads)
  const polylinePoints: [number, number][] = stopCoords.filter(
    (c): c is [number, number] => c !== null
  );

  const nextStop = nearestStopIdx < stops.length - 1 ? stops[nearestStopIdx + 1] : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-5 py-3 text-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <h3 className="text-sm font-black">লাইভ ট্র্যাকিং</h3>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">
            {from} → {to}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-slate-300 transition-colors hover:bg-slate-600"
        >
          <X size={18} />
        </button>
      </div>

      {/* 500m Arrival Alert */}
      {arrived && (
        <div className="bg-amber-500 px-4 py-3 text-center text-white">
          <p className="animate-pulse text-sm font-black">
            🔔 আপনার গন্তব্য &quot;{to}&quot; আসছে — এখনই প্রস্তুত হন!
          </p>
        </div>
      )}

      {/* GPS error banner */}
      {geoError && (
        <div className="flex items-center gap-3 bg-red-900/80 px-4 py-3 text-white">
          <AlertTriangle size={16} className="shrink-0 text-amber-400" />
          <p className="text-[11px] font-bold">{geoError}</p>
        </div>
      )}

      {/* Map */}
      <div className="relative flex-1 overflow-hidden">
        {mapLoading ? (
          <div className="flex h-full items-center justify-center bg-slate-800 text-white">
            <div className="text-center">
              <div className="mb-3 animate-pulse text-3xl">🗺️</div>
              <p className="text-sm font-bold text-slate-300">ম্যাপ লোড হচ্ছে...</p>
              <p className="mt-1 text-[10px] text-slate-500">রুটের অবস্থান খোঁজা হচ্ছে</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Road route (solid) when OSRM loaded, dashed straight lines as fallback */}
            {(roadRoute ?? polylinePoints).length >= 2 && (
              <Polyline
                positions={roadRoute ?? polylinePoints}
                pathOptions={{
                  color: '#10b981',
                  weight: 3,
                  dashArray: roadRoute ? undefined : '8,6',
                }}
              />
            )}

            {/* Intermediate stop markers */}
            {stopCoords.slice(1, -1).map((coord, i) =>
              coord ? <Marker key={`mid-${i}`} position={coord} icon={midIcon} /> : null
            )}

            {fromCoord && <Marker position={fromCoord} icon={fromIcon} />}
            {toCoord && <Marker position={toCoord} icon={toIcon} />}

            {userPos && (
              <>
                <CircleMarker
                  center={userPos}
                  radius={14}
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 2 }}
                />
                <CircleMarker
                  center={userPos}
                  radius={7}
                  pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}
                />
                <MapFollower pos={userPos} />
              </>
            )}
          </MapContainer>
        )}

        {/* Legend */}
        {!mapLoading && (
          <div className="absolute bottom-4 right-3 z-[1000] flex flex-col gap-1.5 rounded-2xl bg-white/90 px-3 py-2.5 text-[9px] font-bold text-slate-700 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-emerald-600" />
              <span>শুরু</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-slate-400" />
              <span>স্টপ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-600" />
              <span>গন্তব্য</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span>আপনি</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom status */}
      <div className="border-t border-slate-700 bg-slate-900 px-5 py-4 text-white">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="truncate text-[11px] font-black text-emerald-400">{from}</div>
            <div className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-500">শুরু</div>
          </div>
          <div>
            <div className="text-base font-black text-white">
              {distToDestM !== null ? formatDist(distToDestM) : '—'}
            </div>
            <div className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-500">গন্তব্যে</div>
          </div>
          <div>
            <div className="truncate text-[11px] font-black text-red-400">{to}</div>
            <div className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-500">গন্তব্য</div>
          </div>
        </div>

        {userPos && nextStop && (
          <div className="mt-2.5 rounded-xl bg-slate-800 px-3 py-2 text-center">
            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">পরবর্তী স্টপ</div>
            <div className="mt-0.5 text-[12px] font-black text-amber-400">{nextStop}</div>
          </div>
        )}

        {!userPos && !geoError && (
          <p className="mt-2.5 animate-pulse text-center text-[10px] font-bold text-slate-500">
            📡 GPS সংকেত খোঁজা হচ্ছে...
          </p>
        )}
        {arrived && distToDestM !== null && distToDestM <= 500 && (
          <p className="mt-2 text-center text-[11px] font-black text-amber-400">
            ⚡ মাত্র {formatDist(distToDestM)} দূরে!
          </p>
        )}
      </div>
    </div>
  );
}
