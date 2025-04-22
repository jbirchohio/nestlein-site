'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapView({ locations, center }) {
  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {locations.map((loc) => (
        <Marker
          key={loc.slug}
          position={[loc.latitude, loc.longitude]}
          icon={new L.Icon({ iconUrl: '/pin.svg', iconSize: [32, 32] })}
        >
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
