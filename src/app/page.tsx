'use client';

import { useEffect, useState } from 'react';
import FilterBar from '@/components/FilterBar';
import LocationCard from '@/components/LocationCard';

interface Location {
  slug: string;
  name: string;
  address: string;
  hours?: string;
  logo_url?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  distance?: number;
}

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function HomePage() {
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [filtered, setFiltered] = useState<Location[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [nearMeOnly, setNearMeOnly] = useState(false);

  useEffect(() => {
    async function fetchLocations() {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setAllLocations(data);
      setFiltered(data);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        });
      }
    }
    fetchLocations();
  }, []);

  useEffect(() => {
    let updated = [...allLocations];

    if (userCoords) {
      updated = updated.map((loc) => {
        if (loc.latitude && loc.longitude) {
          const dist = haversine(userCoords.lat, userCoords.lon, loc.latitude, loc.longitude);
          return { ...loc, distance: dist };
        }
        return loc;
      });
    }

    if (nearMeOnly) {
      updated = updated.filter((loc) => loc.distance !== undefined && loc.distance <= 2);
    }

    if (activeFilters.length > 0) {
      updated = updated.filter(loc =>
        loc.tags?.some(tag => activeFilters.includes(tag))
      );
    }

    setFiltered(updated);
  }, [activeFilters, allLocations, userCoords, nearMeOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-4">
      <div className="flex items-center justify-between mb-4">
        <FilterBar
          locations={filtered.map(loc => ({
            ...loc,
            tags: loc.tags ?? [],
          }))}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
        />

        {userCoords && (
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={nearMeOnly}
              onChange={(e) => setNearMeOnly(e.target.checked)}
            />
            Near me (2 mi)
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.length > 0 ? (
          filtered.map((loc) => (
            <LocationCard key={loc.slug} location={loc} />
          ))
        ) : (
          <p className="text-center col-span-full text-slate-500">
            No locations match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
