// Updated version of page.tsx with new schema rendering

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  MapPin, Clock, Phone, Wifi, Power, Volume2,
  Sun, ParkingSquare, Bath, Sandwich, MonitorSmartphone, Star
} from 'lucide-react';

type Location = {
  name: string;
  address: string;
  hours?: string;
  phone_number?: string;
  logo_url?: string;
  website?: string;
  menu_url?: string;
  review_score?: number;
  review_count?: number;
  tags?: string[];
  best_time_to_work_remotely?: string;
  remote_work_summary?: string;
  scores?: {
    food_quality?: number;
    service?: number;
    ambiance?: number;
    value?: number;
    experience?: number;
  };
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
  const router = useRouter();
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
  const scores = location.scores || {};
  const hasTags = Array.isArray(location.tags) && location.tags.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Image */}
        {location.logo_url && (
          <div className="h-64 w-full overflow-hidden">
            <Image
              src={location.logo_url}
              alt={location.name}
              width={800}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-5">
          <h1 className="text-3xl font-bold text-slate-800">{location.name}</h1>

          <div className="space-y-2 text-slate-600 text-sm">
            <p className="flex items-center gap-2"><MapPin size={18} /> {location.address}</p>
            {location.hours && <p className="flex items-center gap-2"><Clock size={18} /> {location.hours}</p>}
            {location.phone_number && <p className="flex items-center gap-2"><Phone size={18} /> {location.phone_number}</p>}
            {location.best_time_to_work_remotely && (
              <p className="flex items-center gap-2 text-blue-600 font-medium mt-2">
                <Clock size={18} /> Best Time to Work: {location.best_time_to_work_remotely}
              </p>
            )}
            {location.review_score && (
              <p className="flex items-center gap-2 text-yellow-600 font-medium mt-1">
                <Star size={18} /> Rating: {location.review_score} ({location.review_count} reviews)
              </p>
            )}
          </div>

          {location.remote_work_summary && (
            <div className="pt-4 text-slate-700 text-sm">
              <p>{location.remote_work_summary}</p>
            </div>
          )}

          {hasTags && (
            <div className="flex flex-wrap gap-2 pt-2">
              {location.tags!.map((tag: string, index) => (
                <span
                  key={tag}
                  className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Remote Work Features */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mt-4 mb-2">Remote Work Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
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

          {/* Scores */}
          {Object.keys(scores).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-700 mt-6 mb-2">Scores</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
                {scores.food_quality && <p>🍽️ Food Quality: {scores.food_quality}/10</p>}
                {scores.service && <p>👥 Service: {scores.service}/10</p>}
                {scores.ambiance && <p>🎧 Ambiance: {scores.ambiance}/10</p>}
                {scores.value && <p>💵 Value: {scores.value}/10</p>}
                {scores.experience && <p>⭐ Experience: {scores.experience}/10</p>}
              </div>
            </div>
          )}

          <div className="pt-6 text-center">
            <button
              onClick={() => router.back()}
              className="inline-block text-sm text-blue-600 hover:underline mt-4"
            >
              ← Back to Listings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
