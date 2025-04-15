'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Wifi,
  Power,
  Volume2,
  MonitorSmartphone,
  Sun,
  Sandwich,
  Bath,
  ParkingSquare,
  Clock,
} from 'lucide-react';

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
  return Boolean(hours); // Placeholder
}

export default function LocationCard({ location }: { location: Location }) {
  const router = useRouter();
  const { slug, name, address, hours, logo_url, tags = [] } = location;

  const closingTime = hours?.split('-')?.[1]?.trim() || 'N/A';
  const isOpen = isOpenNow(hours);
  const visibleTags = tags.slice(0, 3);
  const extraTagCount = (tags.length || 0) - visibleTags.length;

  return (
    <div
      onClick={() => router.push(`/locations/${slug}`)}
      className="cursor-pointer bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="overflow-hidden rounded-t-xl h-44">
        <Image
          src={logo_url || '/placeholder.jpg'}
          alt={name}
          width={400}
          height={200}
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
        />
      </div>

      <div className="p-5 space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">{name}</h2>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOpen ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={isOpen ? 'Open Now' : 'Closed'}
          />
        </div>

        <p className="text-sm text-slate-500 truncate">{address}</p>
        <p className="text-sm text-blue-600 font-medium">
          {isOpen ? 'Open now' : 'Closed'} — until {closingTime}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {visibleTags.map((tag, i) => (
            <span
              key={tag}
              className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
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
    </div>
  );
}
