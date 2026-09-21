'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { resolveDepotCoordinates, ALGERIA_CENTER, ALGERIA_DEFAULT_ZOOM } from '@/lib/geo';
import { PublicDepotResponse, DepotSummaryResponse } from '@/lib/types';
import Link from 'next/link';

// Custom CSS for Leaflet styling
const MAP_CUSTOM_STYLES = `
  .relief-map-container .leaflet-popup-content-wrapper {
    border-radius: 0 !important;
    padding: 0 !important;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3) !important;
    border: 1px solid rgba(148, 163, 184, 0.25) !important;
    background: transparent !important;
  }
  .relief-map-container .leaflet-popup-content {
    margin: 0 !important;
    line-height: 1.5 !important;
  }
  .relief-map-container .leaflet-popup-tip {
    background: #0f172a !important;
    border-radius: 0 !important;
  }
  @keyframes radar-pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
    }
    70% {
      transform: scale(1.15);
      box-shadow: 0 0 0 14px rgba(220, 38, 38, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
    }
  }
  .pulse-crisis {
    animation: radar-pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
  }
`;

export interface MapDepotItem {
  id: string | number;
  name: string;
  wilaya: string;
  commune: string;
  status: string;
  activeShortageCount?: number;
  hasCriticalNeeds?: boolean;
  occupancyPercentage?: number;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
}

interface ReliefMapInnerProps {
  depots: MapDepotItem[];
  selectedDepotId?: string | number | null;
  onSelectDepot?: (depot: MapDepotItem) => void;
  focusedCoordinates?: [number, number] | null;
  className?: string;
}

export default function ReliefMapInner({
  depots,
  selectedDepotId,
  onSelectDepot,
  focusedCoordinates,
  className = 'h-[600px] w-full',
}: ReliefMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: ALGERIA_CENTER,
      zoom: ALGERIA_DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });

    // 100% Free OpenStreetMap tiles (No API key required, multilingual Arabic/French labels)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: ['a', 'b', 'c'],
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control at top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    depots.forEach(depot => {
      const coords = resolveDepotCoordinates({
        id: depot.id,
        wilaya: depot.wilaya,
        location: {
          wilaya: depot.wilaya,
          commune: depot.commune,
          latitude: depot.latitude,
          longitude: depot.longitude,
        },
      });

      const isCritical = Boolean(depot.hasCriticalNeeds || (depot.activeShortageCount && depot.activeShortageCount > 0));
      const isCapacityAlert = depot.status === 'AT_CAPACITY';

      // Build custom HTML icon with zero-radius styling
      const markerHtml = isCritical
        ? `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="absolute w-8 h-8 rounded-none bg-rose-600/30 pulse-crisis"></div>
            <div class="w-7 h-7 rounded-none bg-rose-600 text-white border border-rose-400 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
              <span class="text-xs font-black">!</span>
            </div>
            ${
              depot.activeShortageCount
                ? `<span class="absolute -top-2 -right-2 bg-black text-rose-300 text-[10px] font-mono font-bold px-1 border border-rose-500 rounded-none shadow">
                    ${depot.activeShortageCount}
                   </span>`
                : ''
            }
          </div>
        `
        : isCapacityAlert
        ? `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-6 h-6 rounded-none bg-amber-500 text-white border border-amber-300 flex items-center justify-center shadow-md transform transition-transform group-hover:scale-110">
              <span class="text-[10px] font-bold">⚠️</span>
            </div>
          </div>
        `
        : `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-6 h-6 rounded-none bg-[#0E4B35] text-white border border-emerald-400 flex items-center justify-center shadow-md transform transition-transform group-hover:scale-110">
              <span class="text-[10px] font-bold">✓</span>
            </div>
          </div>
        `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-depot-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(map);

      // Popup content with zero radius and high-contrast Algerian relief styling
      const popupHtml = `
        <div class="w-72 bg-slate-950 text-slate-100 p-4 border border-slate-700 text-right select-text font-sans" dir="rtl">
          <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <span class="text-[10px] font-bold px-1.5 py-0.5 border ${
              isCritical
                ? 'bg-rose-950/80 text-rose-400 border-rose-700'
                : 'bg-emerald-950/80 text-emerald-400 border-emerald-700'
            }">
              ${isCritical ? 'بؤرة احتياج حرج' : 'مستودع نشط'}
            </span>
            <span class="text-[11px] font-mono text-slate-400">#${depot.id}</span>
          </div>

          <h4 class="font-bold text-base text-white mb-1 leading-tight">${depot.name}</h4>
          <p class="text-xs text-slate-400 mb-3">📍 ولاية ${depot.wilaya} - ${depot.commune || 'المركز'}</p>

          ${
            depot.activeShortageCount && depot.activeShortageCount > 0
              ? `
                <div class="bg-rose-900/40 border border-rose-800/80 p-2 mb-3 text-xs text-rose-300 flex items-center justify-between">
                  <span>النواقص والمواد المطلوبة:</span>
                  <span class="font-bold font-mono text-white bg-rose-700 px-1.5 py-0.2">${depot.activeShortageCount} مواد</span>
                </div>
              `
              : ''
          }

          ${
            typeof depot.occupancyPercentage === 'number'
              ? `
                <div class="mb-3 text-xs text-slate-300">
                  <div class="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>نسبة استيعاب المخزن</span>
                    <span class="font-mono font-bold">${depot.occupancyPercentage}%</span>
                  </div>
                  <div class="w-full bg-slate-800 h-1.5">
                    <div class="h-full ${
                      depot.occupancyPercentage > 85 ? 'bg-rose-500' : 'bg-emerald-500'
                    }" style="width: ${Math.min(depot.occupancyPercentage, 100)}%"></div>
                  </div>
                </div>
              `
              : ''
          }

          <div class="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800">
            <a 
              href="/depots/${depot.id}" 
              class="block w-full py-1.5 text-center text-xs font-bold bg-[#0E4B35] hover:bg-[#125e43] text-white transition-colors border border-emerald-600"
            >
              عرض الاحتياجات
            </a>
            <a 
              href="${
                depot.googleMapsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  depot.name + ' ' + depot.wilaya + ' الجزائر'
                )}`
              }" 
              target="_blank" 
              rel="noopener noreferrer"
              class="block w-full py-1.5 text-center text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-600"
            >
              توجيه الشاحنة ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });

      marker.on('click', () => {
        if (onSelectDepot) {
          onSelectDepot(depot);
        }
      });

      markersRef.current[String(depot.id)] = marker;
    });
  }, [depots, onSelectDepot]);

  // Handle selected depot focus & flyTo
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedDepotId) return;

    const marker = markersRef.current[String(selectedDepotId)];
    if (marker) {
      const latLng = marker.getLatLng();
      map.flyTo(latLng, 13, { duration: 1.2 });
      marker.openPopup();
    }
  }, [selectedDepotId]);

  // Handle manual focus coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusedCoordinates) return;
    map.flyTo(focusedCoordinates, 12, { duration: 1.2 });
  }, [focusedCoordinates]);

  // Helper to fit all markers
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const markers = Object.values(markersRef.current);
    if (markers.length === 0) {
      map.setView(ALGERIA_CENTER, ALGERIA_DEFAULT_ZOOM);
      return;
    }

    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.15));
  };

  return (
    <div className={`relative relief-map-container ${className}`}>
      <style>{MAP_CUSTOM_STYLES}</style>
      
      {/* The Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map floating control overlay */}
      <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-2">
        <button
          onClick={handleFitAll}
          type="button"
          className="px-3 py-1.5 text-xs font-bold bg-slate-950/90 text-white border border-slate-700 shadow-md hover:bg-slate-900 transition-colors flex items-center gap-1.5"
          title="عرض جميع المستودعات على خريطة الجزائر"
        >
          <span>🇩🇿</span>
          <span>عرض كامل الرقعة</span>
        </button>
      </div>

      {/* Legend Badge */}
      <div className="absolute top-4 right-4 z-[400] bg-slate-950/95 border border-slate-700/90 p-2.5 text-xs text-slate-200 shadow-lg hidden sm:block select-none font-sans" dir="rtl">
        <div className="text-[11px] font-bold text-slate-400 mb-2 border-b border-slate-800 pb-1">
          دليل الإشارات الميدانية
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-rose-600 border border-rose-400 flex items-center justify-center text-[9px] text-white font-bold">!</span>
            <span>بؤرة طوارئ / احتياج حرج</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-[#0E4B35] border border-emerald-400 flex items-center justify-center text-[9px] text-white">✓</span>
            <span>مستودع إغاثة نشط</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-amber-500 border border-amber-300"></span>
            <span>مستودع مكتمل السعة</span>
          </div>
        </div>
      </div>
    </div>
  );
}
