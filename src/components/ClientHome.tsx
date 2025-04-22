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
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function getDistanceBetween(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
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

export default function HomePage() {
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [distanceLimit, setDistanceLimit] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const isClient = typeof window !== 'undefined';

  useEffect(() => {
    if (isClient) {
      const stored = localStorage.getItem('recentSearches');
      if (stored) setRecentSearches(JSON.parse(stored));
    }
  }, [isClient]);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const fuse = useMemo(() => {
    if (!isClient) return null;
    return new Fuse(allLocations, {
      keys: ['name', 'address', 'tags'],
      threshold: 0.3,
      ignoreLocation: true,
      includeScore: true,
    });
  }, [isClient, allLocations]);

  useEffect(() => {
    async function fetchLocations() {
      const res = await fetch('/api/locations');
      const data = await res.json();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const user = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            setUserCoords(user);
            const withDistances = data.map((loc: Location) => {
              if (loc.latitude && loc.longitude) {
                loc.distance = getDistanceBetween(user.lat, user.lon, loc.latitude, loc.longitude);
              }
              return loc;
            });
            setAllLocations(withDistances);
          },
          () => {
            console.warn('📍 User denied geolocation. Showing fallback.');
            setAllLocations(data);
          }
        );
      } else {
        setAllLocations(data);
      }
    }

    fetchLocations();
  }, []);

  const filteredLocations = useMemo(() => {
    const base = debouncedSearch.trim() && fuse
      ? fuse.search(debouncedSearch).map((result) => result.item)
      : allLocations;

    return base.filter((loc) => {
      const matchesTags = activeTags.length === 0 ||
        activeTags.every(tag => (loc.tags || []).includes(tag));

      const withinDistance = !userCoords || (!loc.latitude || !loc.longitude)
        ? true
        : getDistanceBetween(userCoords.lat, userCoords.lon, loc.latitude, loc.longitude) <= distanceLimit;

      return matchesTags && withinDistance;
    });
  }, [debouncedSearch, activeTags, distanceLimit, userCoords, allLocations, fuse]);

  const mappableLocations = filteredLocations.filter(
    (loc): loc is Location & { latitude: number; longitude: number } =>
      typeof loc.latitude === 'number' && typeof loc.longitude === 'number'
  );

  return (
    <HomeShell>
      <div className="relative mx-auto mb-16 pt-24 pb-20 px-6 sm:px-10 lg:px-16 xl:px-20 max-w-5xl xl:max-w-6xl bg-[url('/urban-oasis-hero.webp')] bg-cover bg-center rounded-xl shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0 rounded-xl" />

        <div className="relative z-10 bg-white/80 backdrop-blur-sm p-6 rounded-xl">
          <h1 className="text-5xl sm:text-6xl font-bold text-[var(--foreground)] mb-4 leading-tight">
            Find Your Next Power Spot.
          </h1>
          <p className="text-xl text-[var(--text-secondary)] font-inter mb-6">
            Browse remote-friendly cafés, cowork corners & creative nooks — filtered by vibe, Wi-Fi, and flow.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              placeholder="Find cafés, workspaces, or vibes near you..."
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                if (value.trim()) {
                  setRecentSearches((prev) => {
                    const updated = [value, ...prev.filter(v => v !== value)].slice(0, 5);
                    if (isClient) localStorage.setItem('recentSearches', JSON.stringify(updated));
                    return updated;
                  });
                }
              }}
              className="flex-1 px-4 py-2 rounded-md border border-[var(--border)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
            />
            <button className="px-6 py-2 rounded-md bg-[var(--accent)] text-white font-semibold hover:brightness-90 transition">
              Search
            </button>
          </div>

          {recentSearches.length > 0 && (
            <div className="mt-4 text-sm text-[var(--text-secondary)] flex flex-wrap justify-center gap-2">
              <span className="font-medium text-[var(--foreground)]">Recent:</span>
              {recentSearches.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-3 py-1 rounded-md bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--border)] border border-[var(--border)] transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
            <FilterBar
              tags={Array.from(new Set(allLocations.flatMap(loc => loc.tags || [])))}
              activeTags={activeTags}
              setActiveTags={setActiveTags}
            />
            {userCoords && (
              <DistanceSliderPill distance={distanceLimit} setDistance={setDistanceLimit} />
            )}
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <ModalWrapper />
      </Suspense>

      {/* Desktop: show list + map */}
  <div className="hidden lg:grid grid-cols-12 gap-6 px-4">
    <div className="col-span-7">
      <LocationCardGrid locations={filteredLocations} />
    </div>
    <div className="col-span-5">
      <MapView
        locations={mappableLocations}
        center={[userCoords?.lat ?? 39.5, userCoords?.lon ?? -98.35]}
      />
    </div>
  </div>

    {/* Mobile: only show list + “View Map” button */}
<div className="fixed bottom-4 right-4 lg:hidden">
  <button
    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-full shadow-lg"
    onClick={() => router.push('/map')}
  >
    <MapPin size={16} />
    View Map
  </button>
</div>

  </HomeShell>
);
}