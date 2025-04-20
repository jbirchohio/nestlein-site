'use client';

import { useState, useEffect } from 'react';
import HomeShell from '@/components/HomeShell';
import Header from '@/components/Header';
import SmartFilterBanner from '@/components/SmartFilterBanner';
import FilterBar from '@/components/FilterBar';
import OpenNowCards from '@/components/home/OpenNowCards';
import TopRatedCards from '@/components/home/TopRatedCards';
import FeaturedTagCards from '@/components/home/FeaturedTagCards';

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

  useEffect(() => {
    async function fetchLocations() {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setAllLocations(data);

      // Attempt geolocation
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

      // Choose a random tag to feature
      const allTags = data.flatMap((loc: Location) => loc.tags || []);
      const uniqueTags = Array.from(new Set(allTags));
      const random = uniqueTags[Math.floor(Math.random() * uniqueTags.length)];
      if (typeof random === 'string') setFeaturedTag(random);
    }

    fetchLocations();
  }, []);

  return (
    <HomeShell>
      {/* 🧭 Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 pt-16 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold font-satoshi text-[var(--foreground)] mb-4">
          Where Remote Works.
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] font-inter">
          Discover remote-ready cafés, creative corners, and cowork spots near you — filtered by vibe, Wi-Fi, outlets, and more.
        </p>
      </div>

      {/* 🔍 Smart Filters */}
      <div className="px-4">
        <SmartFilterBanner />
        <FilterBar
          tags={Array.from(new Set(allLocations.flatMap(loc => loc.tags || [])))}
          activeTags={activeTags}
          setActiveTags={setActiveTags}
        />

        <Header />
      </div>

      {/* 🟢 Open Now */}
      <section className="mt-12 px-4">
        <h2 className="text-2xl font-bold mb-4">Open Near You</h2>
        <OpenNowCards allLocations={allLocations} userCoords={userCoords} />
      </section>

      {/* ⭐ Top Rated */}
      <section className="mt-12 px-4">
        <h2 className="text-2xl font-bold mb-4">Top Rated Spots</h2>
        <TopRatedCards allLocations={allLocations} userCoords={userCoords} />
      </section>

      {/* 🎯 Featured Tag */}
      {featuredTag && (
        <section className="mt-12 px-4">
          <h2 className="text-2xl font-bold mb-4">Featured: {featuredTag}</h2>
          <FeaturedTagCards allLocations={allLocations} tag={featuredTag} userCoords={userCoords} />
        </section>
      )}
    </HomeShell>
  );
}
