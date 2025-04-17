'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { parseHours } from '@/utils/parseHours';

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

export default function LocationCard({ location }: { location: Location }) {
  const router = useRouter();
  const { slug, name, address, hours, logo_url, tags = [] } = location;

  const { message, status } = parseHours(hours || '');

  const visibleTags = tags.slice(0, 3);
  const extraTagCount = tags.length - visibleTags.length;

  const statusColor =
    status === 'open' ? 'text-green-600' : status === 'openingSoon' ? 'text-yellow-600' : 'text-red-600';
  const dotColor =
    status === 'open' ? 'bg-green-500' : status === 'openingSoon' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div
      onClick={() => router.push(`/locations/${slug}`)}
      className="cursor-pointer bg-[var(--background)] rounded-2xl shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border border-[var(--accent-light)]"
    >
      <div className="overflow-hidden rounded-t-2xl h-44">
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
          <h2 className="text-xl font-bold font-satoshi text-[var(--foreground)]">{name}</h2>
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} title={message} />
        </div>

        <p className="text-sm text-[var(--color-text-secondary)] truncate font-inter">{address}</p>

        {typeof location.distance === 'number' && (
          <p className="text-xs text-[var(--accent)] font-inter">
            {location.distance.toFixed(1)} mi from you
          </p>
        )}

        <p className={`text-sm font-medium ${statusColor}`}>{message}</p>

        <div className="flex flex-wrap gap-2 pt-2">
          {visibleTags.map((tag, i) => (
            <span
              key={tag}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-dark)] font-inter animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
            >
              {tag}
            </span>
          ))}
          {extraTagCount > 0 && (
            <span className="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-600 rounded-full font-inter">
              +{extraTagCount} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
