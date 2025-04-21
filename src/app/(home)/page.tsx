'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // 🆕
import HomeShell from '@/components/HomeShell';
import Header from '@/components/Header';
import SmartFilterBanner from '@/components/SmartFilterBanner';
import FilterBar from '@/components/FilterBar';
import OpenNowCards from '@/components/home/OpenNowCards';
import TopRatedCards from '@/components/home/TopRatedCards';
import FeaturedTagCards from '@/components/home/FeaturedTagCards';
import DistanceSliderPill from '@/components/DistanceSliderPill';
import LocationDetail from '@/components/LocationDetail'; // 🆕 (Assuming this exists)
import Modal from '@/components/Modal'; // 🆕 (You’ll define this)

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

  const pathname = usePathname(); // 🆕

  const currentSlug = pathname?.startsWith('/locations/') 
    ? pathname.split('/locations/')[1] 
    : null; // 🆕

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
      <div className="text-center max-w-3xl mx-auto mb-12 pt-16 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold font-satoshi text-[var(--foreground)] mb-4">
          Where Remote Works.
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] font-inter">
          Discover remote-ready cafés, creative corners, and cowork spots near you — filtered by vibe, Wi-Fi, outlets, and more.
        </p>
      </div>

      <div className="px-4">
        <SmartFilterBanner />
        <div className="flex flex-wrap items-start gap-2 mt-4">
          <div className="flex-1">
            <FilterBar
              tags={Array.from(new Set(allLocations.flatMap(loc => loc.tags || [])))}
              activeTags={activeTags}
              setActiveTags={setActiveTags}
            />
          </div>
          <DistanceSliderPill distance={distanceLimit} setDistance={setDistanceLimit} />
        </div>
        <Header />
      </div>

      <section className="mt-12 px-4">
        <h2 className="text-2xl font-bold mb-4">Open Near You</h2>
        <OpenNowCards allLocations={allLocations} userCoords={userCoords} activeTags={activeTags} distanceLimit={distanceLimit}/>
      </section>

      <section className="mt-12 px-4">
        <h2 className="text-2xl font-bold mb-4">Top Rated Spots</h2>
        <TopRatedCards allLocations={allLocations} userCoords={userCoords} activeTags={activeTags} distanceLimit={distanceLimit} />
      </section>

      {featuredTag && (
        <section className="mt-12 px-4">
          <h2 className="text-2xl font-bold mb-4">Featured: {featuredTag}</h2>
          <FeaturedTagCards allLocations={allLocations} tag={featuredTag} userCoords={userCoords} activeTags={activeTags} distanceLimit={distanceLimit}/>
        </section>
      )}

      {/* 🆕 Modal Overlay */}
      {currentSlug && (
        <Modal onClose={() => history.back()}>
          <LocationDetail slug={currentSlug} />
        </Modal>
      )}
    </HomeShell>
  );
}
