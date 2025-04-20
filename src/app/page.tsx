'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    async function fetchLocations() {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setAllLocations(data);

      const tags = Array.from(new Set(data.flatMap((l: Location) => l.tags || [])));
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      if (typeof randomTag === 'string') setFeaturedTag(randomTag);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            localStorage.setItem('roamly_coords', JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude }));
          },
          () => {
            const saved = localStorage.getItem('roamly_coords');
            if (saved) {
              try {
                setUserCoords(JSON.parse(saved));
              } catch {}
            }
          }
        );
      }
    }

    fetchLocations();
  }, []);

  return (
    <HomeShell>
      <Header />
      <SmartFilterBanner />
      <FilterBar />

      {/* 🟢 Open Now */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Open Near You</h2>
        <OpenNowCards allLocations={allLocations} userCoords={userCoords} />
      </section>

      {/* ⭐ Top Rated */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Top Rated Spots</h2>
        <TopRatedCards allLocations={allLocations} userCoords={userCoords} />
      </section>

      {/* 🎯 Featured Tag */}
      {featuredTag && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Featured: {featuredTag}</h2>
          <FeaturedTagCards allLocations={allLocations} tag={featuredTag} userCoords={userCoords} />
        </section>
      )}
    </HomeShell>
  );
}
