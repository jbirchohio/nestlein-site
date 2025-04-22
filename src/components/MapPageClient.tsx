'use client';

import MapView from './MapView';
import { useLocationContext } from '@/context/LocationContext';

export default function MapPageClient() {
  const { locations, center } = useLocationContext();

  return (
    <div className="p-4 h-screen w-full">
      <MapView locations={locations} center={center} />
    </div>
  );
}
