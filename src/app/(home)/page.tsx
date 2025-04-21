'use client';

import { useState, useEffect, useMemo } from 'react';
import HomeShell from '@/components/HomeShell';
import SmartFilterBanner from '@/components/SmartFilterBanner';
import FilterBar from '@/components/FilterBar';
import OpenNowCards from '@/components/home/OpenNowCards';
import TopRatedCards from '@/components/home/TopRatedCards';
import FeaturedTagCards from '@/components/home/FeaturedTagCards';
import DistanceSliderPill from '@/components/DistanceSliderPill';
import ModalWrapper from '@/components/ModalWrapper';
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
  const [featuredTag, setFeaturedTag] = useState<string>('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [distanceLimit, setDistanceLimit] = useState(5);
  const [searchTerm, setSearchTerm] = useState<string>('');
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
    }),
    [allLocations]
  );

  useEffect(() => {
    async function fetchLocations() {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setAllLocations(data);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          },
          () => {
            console.warn('📍 User denied geolocation. Showing nationwide fallback.');
          }
        );
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

      const withinDistance = !userCoords ||
        (loc.distance !== undefined && loc.distance <= distanceLimit);

      return matchesTags && withinDistance;
    });
  }, [debouncedSearch, activeTags, distanceLimit, userCoords, allLocations, fuse]);

  

  return (
    <HomeShell>
      <div className="relative text-center max-w-4xl mx-auto mb-16 px-4 pt-32 pb-24 bg-[url('/hero.jpg')] bg-cover bg-center rounded-xl shadow-lg">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Find Your Next Power Spot.
          </h1>
          <p className="text-xl text-gray-600 font-inter mb-6">
            Browse remote-friendly cafés, cowork corners & creative nooks — filtered by vibe, Wi-Fi, and flow.
          </p>

          <div className=\"flex flex-col sm:flex-row gap-2 mb-4\">
            <input
              type=\"text\"
              placeholder=\"Find cafés, workspaces, or vibes near you...\"
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
              className=\"flex-1 px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-light)]\"
            />
            <button className=\"px-6 py-2 rounded-full bg-[var(--accent)] text-white font-medium hover:opacity-90 transition\">
              Search
            </button>
          </div>

          {/* Trending tags from actual data */}
          <div className=\"mt-2 text-sm text-gray-600 flex flex-wrap justify-center gap-2\">
            <span className=\"font-medium text-gray-700\">Trending:</span>
            $1

{recentSearches.length > 0 && (
  <div className="mt-4 text-sm text-gray-600 flex flex-wrap justify-center gap-2">
    <span className="font-medium text-gray-700">Recent:</span>
    {recentSearches.map((tag) => (
      <button
        key={tag}
        onClick={() => setSearchTerm(tag)}
        className="px-3 py-1 rounded-full bg-gray-200 hover:bg-[var(--accent-light)] hover:text-white transition"
      >
        {tag}
      </button>
    ))}
  </div>
)}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2">
            <FilterBar
              tags={Array.from(new Set(allLocations.flatMap(loc => loc.tags || [])))}
              activeTags={activeTags}
              setActiveTags={setActiveTags}
            />
            <DistanceSliderPill distance={distanceLimit} setDistance={setDistanceLimit} />
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <ModalWrapper />
      </Suspense>

      <div className="px-4">
        <SmartFilterBanner />
      </div>

      <section className="mt-16 px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Open Near You</h2>
        <OpenNowCards allLocations={filteredLocations} userCoords={userCoords} activeTags={activeTags} distanceLimit={distanceLimit} />
      </section>

      <section className="mt-16 px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Top Rated Spots</h2>
        <TopRatedCards allLocations={filteredLocations} userCoords={userCoords} activeTags={activeTags} distanceLimit={distanceLimit} />
      </section>

      {featuredTag && (
        <section className="mt-16 px-4">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Featured: {featuredTag}</h2>
          <FeaturedTagCards
            allLocations={filteredLocations}
            tag={featuredTag}
            userCoords={userCoords}
            activeTags={activeTags}
            distanceLimit={distanceLimit}
          />
        </section>
      )}
    </HomeShell>
  );
}
