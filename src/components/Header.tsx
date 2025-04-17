'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { Filter } from 'lucide-react';
import Link from 'next/link';

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

export default function HeaderWithFilter({
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

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    locations.forEach(loc => loc.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [locations]);

  const availableTags = allTags.filter(tag => !activeFilters.includes(tag));
  const visibleTags = activeFilters.slice(0, 4);

  const toggleTag = (tag: string) => {
    const exists = activeFilters.includes(tag);
    let updated = exists
      ? activeFilters.filter(t => t !== tag)
      : [...activeFilters, tag];

    if (!exists && updated.length > 4) {
      updated = updated.slice(-4);
    }

    setActiveFilters(updated);
    if (!exists) setShowDropdown(false);
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
          const dist = haversine(userCoords.lat, userCoords.lon, loc.latitude, loc.longitude);
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
    const delayedFilter = debounce(applyFilters, 200);
    delayedFilter();
    return delayedFilter.cancel;
  }, [activeFilters, locations, userCoords, nearMe, searchTerm]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--background)] border-b border-[var(--accent-light)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link href="/" className="text-[var(--accent)] font-satoshi font-bold text-xl sm:text-2xl">
          Roamly
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

            {visibleTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="tag-pill bg-[var(--accent)] text-white border border-[var(--accent)] hover:brightness-110"
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)} ✕
              </button>
            ))}

            {availableTags.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border border-[var(--accent-light)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--accent-light)] transition"
                >
                  <Filter size={16} /> More
                </button>

                {showDropdown && (
                  <div className="absolute z-10 mt-2 bg-[var(--background)] border border-[var(--accent-light)] rounded-xl shadow-xl p-2 max-h-64 overflow-y-auto w-52 space-y-1">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="block w-full text-left px-3 py-1 text-sm text-[var(--foreground)] hover:bg-[var(--accent-light)] rounded transition"
                      >
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
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
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--accent-light)] hover:bg-[var(--accent-light)]'
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
