'use client';

import { useState, useEffect } from 'react';
import HomeShell from '@/components/HomeShell';
import Header from '@/components/Header';
import SmartFilterBanner from '@/components/SmartFilterBanner';
import FilterBar from '@/components/FilterBar';
import OpenNowCards from '@/components/home/OpenNowCards';
import TopRatedCards from '@/components/home/TopRatedCards';
import FeaturedTagCards from '@/components/home/FeaturedTagCards';
import DistanceSliderPill from '@/components/DistanceSliderPill';
import ModalWrapper from '@/components/ModalWrapper';
import { Suspense } from 'react';

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
        <OpenNowCards allLocations={allLocations} userCoords={userCoords} activeTags={activeTags} distanceLimit={distanceLimit} />
      </section>

      <section className="mt-16 px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Top Rated Spots</h2>
        <TopRatedCards allLocations={allLocations} userCoords={userCoords} activeTags={activeTags} distanceLimit={distanceLimit} />
      </section>

      {featuredTag && (
        <section className="mt-16 px-4">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Featured: {featuredTag}</h2>
          <FeaturedTagCards
            allLocations={allLocations}
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
