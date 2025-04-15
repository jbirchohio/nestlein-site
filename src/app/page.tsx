'use client';

import { useEffect, useState } from 'react';
import { getAllLocations } from '@/lib/locations';
import FilterBar from '@/components/FilterBar';
import LocationCard from '@/components/LocationCard';

export const dynamic = 'force-static';

interface Location {
  slug: string;
  name: string;
  address: string;
  hours?: string;
  logo_url?: string;
  tags?: string[];
}

function isOpenNow(hours?: string): boolean {
  return Boolean(hours); // Placeholder for future enhancement
}

export default function HomePage() {
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [filtered, setFiltered] = useState<Location[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Fetch all locations on mount
  useEffect(() => {
    async function loadLocations() {
      const data = await getAllLocations();
      setAllLocations(data);
      setFiltered(data);
    }
    loadLocations();
  }, []);

  // Apply filters
  useEffect(() => {
    if (activeFilters.length === 0) {
      setFiltered(allLocations);
    } else {
      setFiltered(
        allLocations.filter(loc =>
          loc.tags?.some(tag => activeFilters.includes(tag))
        )
      );
    }
  }, [activeFilters, allLocations]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-800 pt-8 pb-16">
      {/* Filter Bar */}
      <FilterBar activeFilters={activeFilters} setActiveFilters={setActiveFilters} />

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {filtered.length > 0 ? (
          filtered.map((loc) => (
            <LocationCard key={loc.slug} location={loc} />
          ))
        ) : (
          <p className="text-center col-span-full text-slate-500">No locations match your filters.</p>
        )}
      </div>
    </div>
  );
}
