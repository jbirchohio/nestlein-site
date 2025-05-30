'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { getStructuredData } from '@/utils/structuredData';
import {
  MapPin, Clock, Phone, Wifi, Power, Volume2,
  Sun, ParkingSquare, Bath, Sandwich, MonitorSmartphone, Star
} from 'lucide-react';
import { Location } from '@/types/location';

export default function LocationDetail({ slug }: { slug: string }) {
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

  if (loading || !location) {
    return <div className="p-6">{loading ? 'Brewing your perfect workspace...' : 'Oops. This page is on break.'}</div>;
  }

  const structuredData = getStructuredData(location); // ✅ Now location exists
  const features = location.remote_work_features || {};
  const scores = location.scores || {};
  const hasTags = Array.isArray(location.tags) && location.tags.length > 0;

  return (
    <>
      {structuredData && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        </Head>
      )}

      <div className="text-[var(--foreground)] font-inter">
        {location.logo_url && (
          <div className="h-64 w-full overflow-hidden rounded-xl mb-4">
            <Image src={location.logo_url} alt={location.name} width={800} height={400} className="w-full h-full object-cover" />
          </div>
        )}

        <h1 className="text-2xl font-bold font-satoshi mb-2">{location.name}</h1>

        <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <p className="flex items-center gap-2"><MapPin size={18} /> {location.address}</p>
          {location.hours && <p className="flex items-center gap-2"><Clock size={18} /> {location.hours}</p>}
          {location.phone_number && <p className="flex items-center gap-2"><Phone size={18} /> {location.phone_number}</p>}
          {location.best_time_to_work_remotely && (
            <p className="flex items-center gap-2 text-[var(--accent)] font-medium mt-2">
              <Clock size={18} /> Best Time to Work: {location.best_time_to_work_remotely}
            </p>
          )}
          {location.review_score && (
            <p className="flex items-center gap-2 text-[var(--accent-dark)] font-medium mt-1">
              <Star size={18} /> Rating: {location.review_score} ({location.review_count} reviews)
            </p>
          )}
        </div>

        {location.remote_work_summary && (
          <div className="pt-4 text-sm">
            <p>{location.remote_work_summary}</p>
          </div>
        )}

        {hasTags && (
          <div className="flex flex-wrap gap-2 pt-2">
            {location.tags?.map((tag: string, i: number) => (
              <span
                key={tag}
                className="text-xs font-semibold px-3 py-1 bg-[var(--accent-light)] text-[var(--accent-dark)] rounded-full animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="pt-6">
          <h2 className="text-lg font-semibold font-satoshi mb-2">Remote Work Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--color-text-secondary)]">
            {features.wi_fi_quality && <p className="flex items-center gap-2"><Wifi size={18} /> Wi-Fi: {features.wi_fi_quality}</p>}
            {features.outlet_access && <p className="flex items-center gap-2"><Power size={18} /> Outlets: {features.outlet_access}</p>}
            {features.noise_level && <p className="flex items-center gap-2"><Volume2 size={18} /> Noise: {features.noise_level}</p>}
            {features.seating_comfort && <p className="flex items-center gap-2"><MonitorSmartphone size={18} /> Seating: {features.seating_comfort}</p>}
            {features.natural_light && <p className="flex items-center gap-2"><Sun size={18} /> Light: {features.natural_light}</p>}
            {features.food_drink_options && <p className="flex items-center gap-2"><Sandwich size={18} /> Menu: {features.food_drink_options}</p>}
            {features.bathroom_access && <p className="flex items-center gap-2"><Bath size={18} /> Bathroom: {features.bathroom_access}</p>}
            {features.parking_availability && <p className="flex items-center gap-2"><ParkingSquare size={18} /> Parking: {features.parking_availability}</p>}
          </div>
        </div>

        {Object.keys(scores).length > 0 && (
          <div className="pt-6">
            <h2 className="text-lg font-semibold font-satoshi mb-2">Scores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--color-text-secondary)]">
              {scores.food_quality && <p>🍽️ Food Quality: {scores.food_quality}/10</p>}
              {scores.service && <p>👥 Service: {scores.service}/10</p>}
              {scores.ambiance && <p>🎧 Ambiance: {scores.ambiance}/10</p>}
              {scores.value && <p>💵 Value: {scores.value}/10</p>}
              {scores.experience && <p>⭐ Experience: {scores.experience}/10</p>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
