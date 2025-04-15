'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Location {
  slug: string;
  name: string;
  address: string;
  hours?: string;
  logo_url?: string;
  tags?: string[];
  best_time_to_work_remotely?: string;
  remote_work_features?: {
    wi_fi_quality?: string;
    outlet_access?: string;
    noise_level?: string;
    seating_comfort?: string;
    natural_light?: string;
    stay_duration_friendliness?: string;
    food_drink_options?: string;
    bathroom_access?: string;
    parking_availability?: string;
  };
}

function isOpenNow(hours?: string): boolean {
  if (!hours) return false;
  // Placeholder logic: always open
  return true;
}

export default function LocationCard({ location }: { location: Location }) {
  const [flipped, setFlipped] = useState(false);

  const { name, address, hours, logo_url, tags = [], slug } = location;
  const closingTime = hours?.split('-')?.[1]?.trim() || 'N/A';
  const open = isOpenNow(hours);
  const visibleTags = tags.slice(0, 3);
  const extraTagCount = tags.length - visibleTags.length;

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className={`flip-card cursor-pointer group transition-transform duration-300 transform ${
        flipped ? 'rotate-y-180' : ''
      }`}
    >
      <div className="flip-card-inner relative w-full h-80 [transform-style:preserve-3d]">
        {/* Front */}
        <Link
          href={`/locations/${slug}`}
          className="flip-card-front absolute w-full h-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden"
        >
          <Image
            src={logo_url || '/placeholder.jpg'}
            alt={name}
            width={400}
            height={200}
            className="w-full h-40 object-cover"
          />
          <div className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">{name}</h2>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  open ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={open ? 'Open Now' : 'Closed'}
              />
            </div>
            <p className="text-sm text-slate-500 truncate">{address}</p>
            <p className="text-sm text-blue-600">
              {open ? 'Open now' : 'Closed'} — until {closingTime}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {visibleTags.map((tag, index) => (
                <span
                  key={tag}
                  className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  {tag}
                </span>
              ))}
              {extraTagCount > 0 && (
                <span className="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-600 rounded-full">
                  +{extraTagCount} more
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Back */}
        <div className="flip-card-back absolute w-full h-full bg-blue-50 rounded-xl shadow-inner px-4 py-5 text-sm text-blue-800 overflow-y-auto [transform:rotateY(180deg)]">
  <h3 className="font-semibold mb-2">Remote Work Info</h3>

  {location.best_time_to_work_remotely && (
    <p className="mb-2">
      <strong>Best Time:</strong> {location.best_time_to_work_remotely}
    </p>
  )}

  <ul className="space-y-1 text-sm">
    {location.remote_work_features?.wi_fi_quality && (
      <li><strong>Wi-Fi:</strong> {location.remote_work_features.wi_fi_quality}</li>
    )}
    {location.remote_work_features?.outlet_access && (
      <li><strong>Outlets:</strong> {location.remote_work_features.outlet_access}</li>
    )}
    {location.remote_work_features?.noise_level && (
      <li><strong>Noise:</strong> {location.remote_work_features.noise_level}</li>
    )}
    {location.remote_work_features?.seating_comfort && (
      <li><strong>Seating:</strong> {location.remote_work_features.seating_comfort}</li>
    )}
    {location.remote_work_features?.natural_light && (
      <li><strong>Light:</strong> {location.remote_work_features.natural_light}</li>
    )}
    {location.remote_work_features?.food_drink_options && (
      <li><strong>Menu:</strong> {location.remote_work_features.food_drink_options}</li>
    )}
    {location.remote_work_features?.bathroom_access && (
      <li><strong>Bathroom:</strong> {location.remote_work_features.bathroom_access}</li>
    )}
    {location.remote_work_features?.parking_availability && (
      <li><strong>Parking:</strong> {location.remote_work_features.parking_availability}</li>
    )}
  </ul>
</div>
  );
}
