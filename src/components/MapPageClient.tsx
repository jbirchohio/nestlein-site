'use client';

import { useEffect, useState } from 'react';
import MapView from './MapView';

export default function MapPageClient() {
  const [locations, setLocations] = useState([]);
  const [center, setCenter] = useState<[number, number]>([39.5, -98.35]);

  useEffect(() => {
    async function fetchLocations() {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(data);
    }

    fetchLocations();
  }, []);

  return (
    <div className="h-screen w-full">
      <MapView locations={locations} center={center} />
    </div>
  );
}
