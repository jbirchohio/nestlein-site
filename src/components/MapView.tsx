// src/components/MapView.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { useState, useEffect } from 'react';

const pinIcon = new L.Icon({
  iconUrl: '/remote-control-buttons.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'roamly-pin',
});

function AutoZoom({ locations }: { locations: { latitude: number; longitude: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (!locations.length) return;
    const bounds = L.latLngBounds(
      locations.map(loc => [loc.latitude, loc.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [locations, map]);
  return null;
}

interface MapViewProps {
  locations: { slug: string; name: string; latitude: number; longitude: number }[];
  center: [number, number];
  zoom?: number;
}

export default function MapView({ locations, center, zoom = 12 }: MapViewProps) {
  return (
    <div className="map-wrapper">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {locations.map(loc => (
          <Marker key={loc.slug} position={[loc.latitude, loc.longitude]} icon={pinIcon}>
            <Popup>{loc.name}</Popup>
          </Marker>
        ))}
        <AutoZoom locations={locations} />
      </MapContainer>
    </div>
  );
}
