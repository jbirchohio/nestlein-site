// components/ClientHome.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import HomeShell from '@/components/HomeShell';
import FilterBar from '@/components/FilterBar';
import DistanceSliderPill from '@/components/DistanceSliderPill';
import ModalWrapper from '@/components/ModalWrapper';
import LocationCardGrid from '@/components/LocationCardGrid';
import MapView from '@/components/MapView';
import { Suspense } from 'react';
import Fuse from 'fuse.js';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debounced;
}

function getDistanceBetween(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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

export default function ClientHome() {
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [distanceLimit, setDistanceLimit] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const isClient = typeof window !== 'undefined';

  // hydrate recentSearches from localStorage
  useEffect(() => {
    if (isClient) {
      const stored = localStorage.getItem('recentSearches');
      if (stored) setRecentSearches(JSON.parse(stored));
    }
  }, [isClient]);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // only initialize Fuse on the client
  const fuse = useMemo(() => {
    if (!isClient) return null;
    return new Fuse(allLocations, {
      keys: ['name', 'address', 'tags'],
      threshold: 0.3,
      ignoreLocation: true,
      includeScore: true,
    });
  }, [isClient, allLocations]);

  // fetch locations + distances
  useEffect(() => {
    async function fetchLocations() {
      const res = await fetch('/api/locations');
      const data: Location[] = await res.json();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const user = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            setUserCoords(user);
            const withDistances = data.map(loc => {
              if (loc.latitude != null && loc.longitude != null) {
                loc.distance = getDistanceBetween(user.lat, user.lon, loc.latitude, loc.longitude);
              }
              return loc;
            });
            setAllLocations(withDistances);
          },
          () => setAllLocations(data)
        );
      } else {
        setAllLocations(data);
      }
    }
    fetchLocations();
  }, []);

  // filter/sort
  const filteredLocations = useMemo(() => {
    const base = debouncedSearch.trim() && fuse
      ? fuse.search(debouncedSearch).map(r => r.item)
      : allLocations;

    return base.filter(loc => {
      const okTags = activeTags.length === 0
        || activeTags.every(t => loc.tags?.includes(t));
      const okDist = !userCoords || loc.distance! <= distanceLimit;
      return okTags && okDist;
    });
  }, [debouncedSearch, activeTags, distanceLimit, userCoords, allLocations, fuse]);

  const mappableLocations = filteredLocations.filter(
    (loc): loc is Location & { latitude: number; longitude: number } =>
      typeof loc.latitude === 'number' && typeof loc.longitude === 'number'
  );

  return (
    <HomeShell>
      {/* Hero, search + filters ... */}
      <div className="relative mx-auto mb-16 pt-24 pb-20 px-6 sm:px-10 lg:px-16 xl:px-20 max-w-5xl xl:max-w-6xl bg-[url('/urban-oasis-hero.webp')] bg-cover bg-center rounded-xl shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0 rounded-xl" />
        <div className="relative z-10 bg-white/80 backdrop-blur-sm p-6 rounded-xl">
          {/* ...same JSX input/search/filter as before... */}
        </div>
      </div>

      <Suspense fallback={null}>
        <ModalWrapper />
      </Suspense>

      {/* Desktop: side‑by‑side */}
      <div className="hidden lg:grid grid-cols-12 gap-6 px-4">
        <div className="col-span-7">
          <LocationCardGrid locations={filteredLocations} />
        </div>
        <div className="col-span-5">
          <MapView locations={mappableLocations}
                   center={[
                     userCoords?.lat ?? 39.5,
                     userCoords?.lon ?? -98.35,
                   ]} />
        </div>
      </div>

      {/* Mobile drawer */}
      <div className="lg:hidden">
        <LocationCardGrid locations={filteredLocations} />
        <MapView locations={mappableLocations}
                 center={[
                   userCoords?.lat ?? 39.5,
                   userCoords?.lon ?? -98.35,
                 ]} />
      </div>
    </HomeShell>
  );
}
