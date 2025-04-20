'use client';

import { useEffect, useState } from 'react';
import FeaturedTagCards from './FeaturedTagCards';
import OpenNowCards from './OpenNowCards';
import TopRatedCards from './TopRatedCards';

interface Location {
  slug: string;
  name: string;
  address: string;
  logo_url?: string;
  tags?: string[];
  review_score?: number;
  hours?: string;
  latitude?: number;
  longitude?: number;
}

export default function HomeShell({ allLocations }: { allLocations: Location[] }) {
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [featuredTag, setFeaturedTag] = useState<string>('Café');

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Location denied or unavailable:', err.message);
        }
      );
    }

    // Rotate random featured tag
    const allTags = allLocations.flatMap((loc) => loc.tags || []);
    if (allTags.length > 0) {
      const uniqueTags = Array.from(new Set(allTags));
      const random = uniqueTags[Math.floor(Math.random() * uniqueTags.length)];
      setFeaturedTag(random);
    }
  }, [allLocations]);

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-4">🌐 Open Now Near You</h2>
        <OpenNowCards allLocations={allLocations} userCoords={userCoords} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">⭐ Top Rated Spots</h2>
        <TopRatedCards allLocations={allLocations} userCoords={userCoords} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">🎯 Featured: {featuredTag}</h2>
        <FeaturedTagCards allLocations={allLocations} tag={featuredTag} userCoords={userCoords} />
      </section>
    </div>
  );
}
