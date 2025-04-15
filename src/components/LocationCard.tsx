'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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

const featureIcons: { [key: string]: React.ReactNode } = {
  wi_fi_quality: <Wifi size={16} />,
  outlet_access: <Power size={16} />,
  noise_level: <Volume2 size={16} />,
  seating_comfort: <MonitorSmartphone size={16} />,
  natural_light: <Sun size={16} />,
  stay_duration_friendliness: <Clock size={16} />,
  food_drink_options: <Sandwich size={16} />,
  bathroom_access: <Bath size={16} />,
  parking_availability: <ParkingSquare size={16} />,
};

function isOpenNow(hours?: string): boolean {
  return Boolean(hours); // Placeholder logic
}

export default function LocationCard({ location }: { location: Location }) {
  const [flipped, setFlipped] = useState(false);
  const router = useRouter();
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const { slug, name, address, hours, logo_url, tags = [] } = location;
  const closingTime = hours?.split('-')?.[1]?.trim() || 'N/A';
  const open = isOpenNow(hours);
  const visibleTags = tags.slice(0, 3);
  const extraTagCount = tags.length - visibleTags.length;

  function handleCardClick() {
    if (window.innerWidth < 768) {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
        tapTimeout.current = null;
        router.push(`/locations/${slug}`);
      } else {
        tapTimeout.current = setTimeout(() => {
          setFlipped(!flipped);
          tapTimeout.current = null;
        }, 300);
      }
    } else {
      setFlipped(!flipped);
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`flip-card cursor-pointer group transition-transform duration-300 transform ${
        flipped ? 'rotate-y-180' : ''
      }`}
    >
      <div className="flip-card-inner relative w-full h-80 [transform-style:preserve-3d]">
        {/* Front */}
        <div className="flip-card-front absolute w-full h-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
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

        {/* Back */}
        <div
          className="flip-card-back absolute w-full h-full bg-blue-50 rounded-xl shadow-inner px-4 py-5 text-sm text-slate-700 [transform:rotateY(180deg)] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            {location.best_time_to_work_remotely && (
              <p className="font-semibold text-blue-700">
                Best time to work:{' '}
                <span className="font-normal">{location.best_time_to_work_remotely}</span>
              </p>
            )}
            {location.remote_work_features && (
              <ul className="space-y-1">
                {Object.entries(location.remote_work_features)
                  .filter(([, value]) =>
  value &&
  typeof value === 'string' &&
  value.toLowerCase() !== 'unknown'
)

                  .sort(() => 0.5 - Math.random())
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <li key={key} className="flex items-center gap-2">
                      {featureIcons[key] || null}
                      <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">{value}</span>
                    </li>
                  ))}
              </ul>
            )}
            <p className="text-xs text-center mt-4 text-slate-500">
              Tap to flip back<br />Double tap to view full listing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
