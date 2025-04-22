// src/components/MapView.tsx
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { useSwipeToDismiss } from '@/hooks/useSwipeToDismiss';

const pinIconUrl = '/remote-control-buttons.svg';

interface Location {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface MapViewProps {
  locations: Location[];
  center: [number, number];
  zoom?: number;
  className?: string;
}

const CustomPin = new L.Icon({
  iconUrl: pinIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'roamly-pin',
});

function AutoZoom({ locations }: { locations: Location[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) return;
    const bounds = L.latLngBounds(
      locations.map((loc) => [loc.latitude, loc.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [locations, map]);

  return null;
}

export default function MapView({
  locations,
  center,
  zoom = 12,
  className = '',
}: MapViewProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { ref, bounced } = useSwipeToDismiss(() => setIsVisible(false), 80);

  return (
    <>
      {!isVisible && (
        <button
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-[var(--accent)] text-white rounded-full z-50 shadow-lg"
          onClick={() => setIsVisible(true)}
        >
          🗺️ Show Map
        </button>
      )}

      <div
        ref={ref}
        className={[
          'map-wrapper',
          'transition-transform duration-300 ease-in-out',
          !isVisible && 'hidden',
          bounced && 'animate-bounce-back',
          className, // now accepted
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <MapContainer
          className="leaflet-map"
          center={center}
          zoom={zoom}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {locations.map((loc) => (
            <Marker key={loc.slug} position={[loc.latitude, loc.longitude]} icon={CustomPin}>
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}

          <AutoZoom locations={locations} />
        </MapContainer>
      </div>
    </>
  );
}
