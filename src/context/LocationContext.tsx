'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Shared map‑location type
export interface MapLocation {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  locations: MapLocation[];
  setLocations: React.Dispatch<React.SetStateAction<MapLocation[]>>;
  center: [number, number];
  setCenter: React.Dispatch<React.SetStateAction<[number, number]>>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [center, setCenter] = useState<[number, number]>([39.5, -98.35]);

  return (
    <LocationContext.Provider value={{ locations, setLocations, center, setCenter }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextType {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationContext must be used within LocationProvider');
  return ctx;
}
