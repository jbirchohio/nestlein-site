'use client';

import { useEffect, useState } from 'react';
import FilterBar from '@/components/FilterBar';
import LocationCard from '@/components/LocationCard';

interface Location {
  slug: string;
  name: string;
  address: string;
  hours?: string;
  logo_url?: string;
  tags?: string[];
}

export default function HomePage() {
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [filtered, setFiltered] = useState<Location[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    async function fetchLocations() {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setAllLocations(data);
      setFiltered(data);
    }
    fetchLocations();
  }, []);

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
      <FilterBar activeFilters={activeFilters} setActiveFilters={setActiveFilters} />

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
