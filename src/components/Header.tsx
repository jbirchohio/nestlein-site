'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { debounce } from 'lodash';

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

export default function Header({
  locations,
  setFiltered,
  userCoords,
}: {
  locations: Location[];
  setFiltered: (locs: Location[]) => void;
  userCoords: { lat: number; lon: number } | null;
}) {
  const pathname = usePathname();
  const isSlugPage = pathname?.startsWith('/locations/');

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [nearMe, setNearMe] = useState(false);

  const allTags = Array.from(
    new Set(locations.flatMap((loc) => loc.tags ?? []))
  ).sort();

  const toggleTag = (tag: string) => {
    setActiveFilters((prev) => {
      const updated = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag];
      return updated.length > 4 ? updated.slice(-4) : updated;
    });
    setShowDropdown(false);
  };

  const applyFilters = () => {
    let filtered = [...locations];

    if (userCoords) {
      const toRad = (x: number) => (x * Math.PI) / 180;
      const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 3958.8;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      filtered = filtered.map((loc) => {
        if (loc.latitude && loc.longitude) {
          const dist = haversine(
            userCoords.lat,
            userCoords.lon,
            loc.latitude,
            loc.longitude
          );
          return { ...loc, distance: dist };
        }
        return loc;
      });
    }

    if (nearMe) {
      filtered = filtered.filter((loc) => loc.distance !== undefined && loc.distance <= 2);
    }

    if (activeFilters.length > 0) {
      filtered = filtered.filter((loc) =>
        loc.tags?.some((tag) => activeFilters.includes(tag))
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (loc) =>
          loc.name.toLowerCase().includes(term) ||
          loc.tags?.some((t) => t.toLowerCase().includes(term))
      );
    }

    setFiltered(filtered);
  };

  useEffect(() => {
    const delayedFilter = debounce(applyFilters, 250);
    delayedFilter();
    return delayedFilter.cancel;
  }, [activeFilters, locations, userCoords, nearMe, searchTerm]);

  const availableTags = allTags.filter((t) => !activeFilters.includes(t));

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200 shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link href="/" className="text-blue-600 font-bold text-xl sm:text-2xl">
          NestleIn
        </Link>

        {!isSlugPage && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-1 text-sm w-48"
            />

            {activeFilters.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white border border-blue-600"
              >
                {tag} ✕
              </button>
            ))}

            {availableTags.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="px-3 py-1 rounded-full text-sm font-medium border border-slate-300 bg-white text-slate-600 hover:bg-blue-100"
                >
                  + More
                </button>

                {showDropdown && (
                  <div className="absolute z-10 mt-2 bg-white border border-slate-300 rounded-md shadow-lg p-2 max-h-64 overflow-y-auto w-48">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="block w-full text-left px-3 py-1 text-sm text-slate-700 hover:bg-blue-100 rounded"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setNearMe((prev) => !prev)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200 ${
                nearMe
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-blue-100'
              }`}
            >
              Near me (2 mi)
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
