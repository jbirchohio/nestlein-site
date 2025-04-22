// src/app/map/page.tsx
'use client';

import MapView from '@/components/MapView';
import { useEffect } from 'react';
import { useLocationContext } from '@/context/LocationContext';

export default function Page() {
  const { locations, center } = useLocationContext();

  useEffect(() => {
    // (Optional) log or analytics
  }, []);

  return (
    <div className="p-4 h-screen w-full">
      <MapView locations={locations} center={center} />
    </div>
  );
}
