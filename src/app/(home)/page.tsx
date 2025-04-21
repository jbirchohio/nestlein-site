'use client';

import { useState, useEffect, useMemo } from 'react';
import HomeShell from '@/components/HomeShell';
import SmartFilterBanner from '@/components/SmartFilterBanner';
import FilterBar from '@/components/FilterBar';
import FeaturedTagCards from '@/components/home/FeaturedTagCards';
import DistanceSliderPill from '@/components/DistanceSliderPill';
import ModalWrapper from '@/components/ModalWrapper';
import LocationCardGrid from '@/components/LocationCardGrid';
import { Suspense } from 'react';
import Fuse from 'fuse.js';

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
  const [featuredTag, setFeaturedTag] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [distanceLimit, setDistanceLimit] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('recentSearches');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  const fuse = useMemo(() =>
    new Fuse(allLocations, {
      keys: ['name', 'address', 'tags'],
      threshold: 0.3,
      ignoreLocation: true,
      includeScore: true,
    }), [allLocations]
  );

  useEffect(() => {
    async function fetchLocations() {
      const res = await fetch('/api/locations');
      const data = await res.json();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const user = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            setUserCoords(user);
            // Add distance to each location
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

      const allTags = data.flatMap((loc: Location) => loc.tags || []);
      const uniqueTags = Array.from(new Set(allTags));
      const random = uniqueTags[Math.floor(Math.random() * uniqueTags.length)];
      if (typeof random === 'string') setFeaturedTag(random);
    }

    fetchLocations();
  }, []);

  const filteredLocations = useMemo(() => {
    const base = debouncedSearch.trim()
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

  const hasFilters = debouncedSearch.trim() || activeTags.length > 0;

  return (
    <HomeShell>
      <div className="relative text-center max-w-4xl mx-auto mb-16 px-4 pt-32 pb-24 bg-[url('/urban-oasis-hero.webp')] bg-cover bg-center rounded-xl shadow-lg">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl">
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
                    localStorage.setItem('recentSearches', JSON.stringify(updated));
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

      <section className="mt-16 px-4 animate-fade-in">
        <h2 className="text-3xl font-bold mb-6 text-[var(--foreground)]">
          {hasFilters ? 'Filtered Results' : 'Featured Remote Spots'}
        </h2>
        <LocationCardGrid locations={hasFilters ? filteredLocations : allLocations.slice(0, 6)} />
      </section>

  
    </HomeShell>
  );
}
