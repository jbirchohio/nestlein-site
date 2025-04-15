'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  MapPin,
  Clock,
  Phone,
  Wifi,
  Power,
  Volume2,
  Sun,
  ParkingSquare,
  Bath,
  Sandwich,
  MonitorSmartphone
} from 'lucide-react';

type Location = {
  name: string;
  address: string;
  hours?: string;
  phone_number?: string;
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

  const features = location.remote_work_features || {};

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden">
        {location.logo_url && (
          <div className="h-60 w-full overflow-hidden">
            <Image
              src={location.logo_url}
              alt={location.name}
              width={800}
              height={400}
              className="object-cover w-full h-full"
            />
          </div>
        )}
  
        <div className="p-6 space-y-4">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">{location.name}</h1>
  
          <div className="space-y-1 text-gray-700 dark:text-zinc-300 text-sm">
            <p className="flex items-center gap-2">
              <MapPin size={18} /> {location.address}
            </p>
            {location.hours && (
              <p className="flex items-center gap-2">
                <Clock size={18} /> {location.hours}
              </p>
            )}
            {location.phone_number && (
              <p className="flex items-center gap-2">
                <Phone size={18} /> {location.phone_number}
              </p>
            )}
            {location.best_time_to_work_remotely && (
              <p className="flex items-center gap-2 text-violet-400 font-medium mt-2">
                <Clock size={18} /> Best Time to Work: {location.best_time_to_work_remotely}
              </p>
            )}
          </div>
  
          {location.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {location.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block text-xs font-medium px-2 py-1 bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
  
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mt-6">Remote Work Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-700 dark:text-zinc-300">
            {features.wi_fi_quality && (
              <p className="flex items-center gap-2"><Wifi size={18} /> Wi-Fi: {features.wi_fi_quality}</p>
            )}
            {features.outlet_access && (
              <p className="flex items-center gap-2"><Power size={18} /> Outlets: {features.outlet_access}</p>
            )}
            {features.noise_level && (
              <p className="flex items-center gap-2"><Volume2 size={18} /> Noise: {features.noise_level}</p>
            )}
            {features.seating_comfort && (
              <p className="flex items-center gap-2"><MonitorSmartphone size={18} /> Seating: {features.seating_comfort}</p>
            )}
            {features.natural_light && (
              <p className="flex items-center gap-2"><Sun size={18} /> Light: {features.natural_light}</p>
            )}
            {features.food_drink_options && (
              <p className="flex items-center gap-2"><Sandwich size={18} /> Menu: {features.food_drink_options}</p>
            )}
            {features.bathroom_access && (
              <p className="flex items-center gap-2"><Bath size={18} /> Bathroom: {features.bathroom_access}</p>
            )}
            {features.parking_availability && (
              <p className="flex items-center gap-2"><ParkingSquare size={18} /> Parking: {features.parking_availability}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  