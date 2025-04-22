'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define your shared location type
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

// Custom hook for consuming the context
export function useLocationContext(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
