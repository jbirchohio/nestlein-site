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
        <div className="flip-card-back absolute w-full h-full bg-blue-50 rounded-xl shadow-inner flex items-center justify-center text-blue-700 text-sm px-4 [transform:rotateY(180deg)]">
          Tap to flip back or view more info
        </div>
      </div>
    </div>
  );
}
