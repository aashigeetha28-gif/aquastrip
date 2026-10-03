import { useEffect, useRef, type FC } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { VillageStatus, TestRecord } from '../types';
import { MapPin, Info } from 'lucide-react';

interface VillageMapProps {
  villages: VillageStatus[];
  recentTests: TestRecord[];
  selectedVillageId: string | null;
  onSelectVillage: (villageId: string) => void;
}

export const VillageMap: FC<VillageMapProps> = ({
  villages,
  recentTests,
  selectedVillageId,
  onSelectVillage,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center map around Pune District rural belt (lat: 18.55, lng: 74.25)
      const map = L.map(mapContainerRef.current, {
        center: [18.55, 74.25],
        zoom: 9,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add colored status markers for each village
    villages.forEach((village) => {
      let pinColor = '#16A34A'; // Green = Safe
      let statusLabel = 'SAFE (0.2-1.0 ppm)';

      if (village.latestStatus === 'low') {
        pinColor = '#DC2626'; // Red = Low
        statusLabel = 'LOW FRC (<0.2 ppm)';
      } else if (village.latestStatus === 'high') {
        pinColor = '#D97706'; // Amber = High
        statusLabel = 'HIGH (>1.0 ppm)';
      }

      // Modern SVG Pin Marker
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${pinColor};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background-color: #FFFFFF;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Filter recent tests for this village
      const vTests = recentTests
        .filter((t) => t.village_id === village.id)
        .slice(0, 3);

      const testsHtml = vTests
        .map(
          (t) => `
          <div style="font-size: 11px; margin-top: 4px; padding: 4px 6px; background-color: #F8FAFC; border-radius: 4px; display: flex; justify-content: space-between;">
            <span style="font-weight: 600; color: #1E293B;">${t.frc_range}</span>
            <span style="color: #64748B;">${new Date(t.tested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
        `
        )
        .join('');

      const popupContent = `
        <div style="font-family: inherit; min-width: 190px;">
          <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-bottom: 2px;">
            ${village.name}
          </div>
          <div style="font-size: 11px; font-weight: 700; color: ${pinColor}; margin-bottom: 6px;">
            Latest: ${statusLabel} (${village.latestFrcRange})
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
            Safe Compliance: <b>${village.safePercentage}%</b> (${village.totalTests} tests)
          </div>
          <div style="border-top: 1px solid #E2E8F0; padding-top: 6px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase;">Recent Tests:</div>
            ${testsHtml || '<div style="font-size: 11px; color: #94A3B8;">No recent tests</div>'}
          </div>
        </div>
      `;

      const marker = L.marker([village.lat, village.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent);

      marker.on('click', () => {
        onSelectVillage(village.id);
      });

      markersRef.current[village.id] = marker;
    });
  }, [villages, recentTests, onSelectVillage]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Geographic Residual Chlorine Map</h3>
            <p className="text-xs text-slate-500">Live Gram Panchayat water quality status across Pune District</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Safe (0.2-1.0 ppm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span>Low (&lt;0.2 ppm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>High (&gt;1.0 ppm)</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative mt-4">
        <div
          ref={mapContainerRef}
          className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 z-10"
        />

        {/* Floating Quick Filter Indicator */}
        {selectedVillageId && (
          <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-sm border border-slate-300 text-xs px-3 py-1.5 rounded-lg shadow font-medium flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-teal-600" />
            <span>Filtered: <b>{villages.find((v) => v.id === selectedVillageId)?.name}</b></span>
            <button
              onClick={() => onSelectVillage('')}
              className="text-teal-700 underline font-bold ml-1 hover:text-teal-900"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
