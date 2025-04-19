'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
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

  useEffect(() => {
    async function fetchLocations() {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setAllLocations(data);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        });
      }

      // Random tag logic for Featured section
      const allTags = data.flatMap((loc: Location) => loc.tags || []);
      const uniqueTags = Array.from(new Set(allTags));
      const random = uniqueTags[Math.floor(Math.random() * uniqueTags.length)];
      if (typeof random === 'string') setFeaturedTag(random);

    }

    fetchLocations();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-16 pb-10">
      {/* 🧭 Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold font-satoshi text-[var(--foreground)] mb-4">
          Where Remote Works.
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] font-inter">
          Discover remote-ready cafes, cozy cowork spots, and creative corners near you — filtered by vibe, Wi-Fi, outlets, and more.
        </p>
      </div>

      {/* 🔍 Filters */}
      <Header
        locations={allLocations}
        setFiltered={() => {}}
        userCoords={userCoords}
      />

      {/* 🟢 Open Now Section */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Open Near You</h2>
        <OpenNowCards allLocations={allLocations} userCoords={userCoords} />
      </section>

      {/* ⭐ Top Rated Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Top Rated Spots</h2>
        <TopRatedCards allLocations={allLocations} />
      </section>

      {/* 🎯 Featured Tag Section */}
      {featuredTag && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Featured: {featuredTag}</h2>
          <FeaturedTagCards allLocations={allLocations} tag={featuredTag} />
        </section>
      )}
    </div>
  );
}
