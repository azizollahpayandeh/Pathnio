import { useEffect, useState } from 'react';
import { FaCarSide, FaCheckCircle, FaRegClock, FaTimesCircle } from 'react-icons/fa';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';

// Dynamically import Leaflet components to prevent SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('react-leaflet').then((mod) => mod.Tooltip),
  { ssr: false }
);

const statusMap: Record<string, string> = {
  moving: 'Moving',
  stopped: 'Stopped',
  offline: 'Offline',
};

const fakeVehicles = [
  {
    id: 1,
    name: 'Peugeot 206',
    driver: 'Ali Rezaei',
    plate: '21الف123',
    status: 'moving',
    lat: 35.6892,
    lng: 51.3890,
    speed: 54,
    lastUpdate: '2025-07-11 12:01',
  },
  {
    id: 2,
    name: 'Pride',
    driver: 'Sara Ahmadi',
    plate: '45ب456',
    status: 'stopped',
    lat: 35.7012,
    lng: 51.4100,
    speed: 0,
    lastUpdate: '2025-07-11 11:59',
  },
  {
    id: 3,
    name: 'Samand',
    driver: 'Mohammad Karimi',
    plate: '78ج789',
    status: 'offline',
    lat: 35.6750,
    lng: 51.4000,
    speed: 0,
    lastUpdate: '2025-07-11 11:40',
  },
];

interface LiveMapWidgetProps {
  fullscreen?: boolean;
}

export default function LiveMapWidget({ fullscreen = false }: LiveMapWidgetProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [statusIcons, setStatusIcons] = useState<Record<string, any>>({});
  const mapHeight = fullscreen ? '100vh' : '480px';

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Import Leaflet dynamically and create icons
    import('leaflet').then((L) => {
      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Create status icons after Leaflet is loaded
      const icons = {
        moving: L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854894.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        }),
        stopped: L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854866.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        }),
        offline: L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        }),
      };
      setStatusIcons(icons);
    });

    const mapContainers = document.getElementsByClassName('leaflet-container');
    for (let i = 0; i < mapContainers.length; i++) {
      const container = mapContainers[i] as HTMLElement;
      container.style.minHeight = fullscreen ? '100vh' : '480px';
      container.style.height = fullscreen ? '100vh' : '480px';
      container.style.borderRadius = fullscreen ? '0' : '1.5rem';
      container.style.boxShadow = fullscreen ? 'none' : '0 4px 32px 0 #c7d2fe55';
    }
  }, [fullscreen, isClient]);

  // Don't render map until client-side and icons are loaded
  if (!isClient || Object.keys(statusIcons).length === 0) {
    return (
      <div className={`w-full bg-blue-50 overflow-hidden shadow-xl relative ${fullscreen ? 'h-screen' : 'h-[480px] rounded-2xl'}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-blue-600 text-lg">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full bg-blue-50 overflow-hidden shadow-xl relative ${fullscreen ? 'h-screen' : 'h-[480px] rounded-2xl'}`}>
      {/* Vehicle counters */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 rounded-xl shadow px-6 py-3 flex gap-6 items-center border border-blue-100">
        <span className="font-bold text-blue-700 text-lg flex items-center gap-2"><FaCarSide className="text-blue-400" />Total: {fakeVehicles.length}</span>
        <span className="font-semibold text-green-600 flex items-center gap-1"><FaCheckCircle />{fakeVehicles.filter(v=>v.status==='moving').length} Moving</span>
        <span className="font-semibold text-yellow-700 flex items-center gap-1"><FaRegClock />{fakeVehicles.filter(v=>v.status==='stopped').length} Stopped</span>
        <span className="font-semibold text-red-600 flex items-center gap-1"><FaTimesCircle />{fakeVehicles.filter(v=>v.status==='offline').length} Offline</span>
      </div>
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 rounded-xl shadow px-4 py-2 flex gap-4 items-center border border-blue-100 text-sm">
        <span className="flex items-center gap-1"><Image src="https://cdn-icons-png.flaticon.com/512/854/854894.png" width={20} height={20} alt="Moving" className="w-5 h-5" /> Moving</span>
        <span className="flex items-center gap-1"><Image src="https://cdn-icons-png.flaticon.com/512/854/854866.png" width={20} height={20} alt="Stopped" className="w-5 h-5" /> Stopped</span>
        <span className="flex items-center gap-1"><Image src="https://cdn-icons-png.flaticon.com/512/854/854878.png" width={20} height={20} alt="Offline" className="w-5 h-5" /> Offline</span>
      </div>
      <MapContainer 
        center={[35.6892, 51.3890] as LatLngExpression} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: mapHeight, width: '100%' }}
        whenReady={() => {
          // Map is ready
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fakeVehicles.map((v) => (
          <Marker key={v.id} position={[v.lat, v.lng] as LatLngExpression} icon={statusIcons[v.status]}>
            <Popup>
              <div className="font-bold text-blue-800 text-lg mb-1">{v.name}</div>
              <div className="text-blue-700 mb-1">Driver: <span className="font-semibold">{v.driver}</span></div>
              <div className="text-gray-700 mb-1">Plate: <span className="font-mono">{v.plate}</span></div>
              <div className="mb-1">Status: <span className="font-semibold">{statusMap[v.status]}</span></div>
              <div className="mb-1">Speed: <span className="font-mono text-blue-700">{v.speed} km/h</span></div>
              <div className="text-xs text-gray-400">Last update: {v.lastUpdate}</div>
            </Popup>
            <Tooltip direction="top" offset={[0, -20]} opacity={0.9} className="font-bold text-blue-800">
              {v.name} ({v.driver})
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 