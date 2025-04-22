'use client';

import React, { useEffect } from 'react';
import MapView from '@/components/MapView';
import { useLocationContext } from '@/context/LocationContext';

export default function MapPage() {
  const { locations, center } = useLocationContext();

  return (
    <div className="h-full">
      <MapView
        locations={locations}
        center={center}
        zoom={12}
      />
    </div>
  );
}
