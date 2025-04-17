'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
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

export default function HomePage() {
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [filtered, setFiltered] = useState<Location[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

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

      {/* 🔍 Filters + Search */}
      <Header
        locations={allLocations}
        setFiltered={setFiltered}
        userCoords={userCoords}
      />

      {/* 📍 Location Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
        {filtered.length > 0 ? (
          filtered.map((loc) => (
            <LocationCard key={loc.slug} location={loc} />
          ))
        ) : (
          <p className="text-center col-span-full text-slate-500 text-lg italic">
            Looks a little quiet here... want to suggest a hidden gem?
          </p>
        )}
      </div>
    </div>
  );
}
