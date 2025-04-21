'use client';

import LocationCard from './LocationCard';

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

export default function LocationCardGrid({ locations }: { locations: Location[] }) {
  if (!locations || locations.length === 0) {
    return (
      <p className="text-center text-sm text-[var(--text-secondary)] mt-8">
        No spots match your filters yet. Try adjusting your search or distance range.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {locations.map((location) => (
        <LocationCard key={location.slug} location={location} />
      ))}
    </div>
  );
}
