'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

type Location = {
  name: string;
  address: string;
  hours?: string;
  logo_url?: string;
  tags?: string[];
};

export default function LocationPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : Array.isArray(params?.slug) ? params.slug[0] : '';
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocation() {
      try {
        const res = await fetch(`/locations/${slug}.json`);
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setLocation(data);
      } catch (err) {
        console.error(err);
        setLocation(null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchLocation();
    }
  }, [slug]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!location) return <div className="p-6">Location not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {location.logo_url && (
        <Image
          src={location.logo_url}
          alt={location.name}
          width={800}
          height={400}
          className="w-full h-60 object-cover rounded mb-4"
        />
      )}
      <h1 className="text-3xl font-bold mb-2">{location.name}</h1>
      <p className="text-gray-600 mb-4">
        {location.address} {location.hours ? `— ${location.hours}` : ''}
      </p>
      <div className="mt-4 space-y-2">
        {location.tags?.map((tag) => (
          <span
            key={tag}
            className="inline-block text-xs font-medium px-2 py-1 bg-violet-100 text-violet-800 rounded-full mr-2"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
