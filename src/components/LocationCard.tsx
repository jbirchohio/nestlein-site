'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { isOpenNow } from '@/utils/checkOpenNow';

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

  const isOpen = isOpenNow(hours);
  const statusColor = isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  const message = isOpen ? 'Open now' : 'Closed';

  const visibleTags = tags.slice(0, 3);
  const extraTagCount = tags.length - visibleTags.length;

  return (
    <div
      onClick={() => router.push(`/?modal=${slug}`)}
      className="cursor-pointer bg-[var(--background)] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group border border-[var(--border)]"
    >
      <div className="overflow-hidden rounded-t-2xl h-44">
        <Image
          src={logo_url || '/placeholder.jpg'}
          alt={name}
          width={400}
          height={200}
          className="w-full h-full object-cover object-center transition-transform group-hover:scale-105 duration-300"
        />
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold font-satoshi text-[var(--foreground)]">{name}</h2>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}
          >
            {message}
          </span>
        </div>

        <p className="text-sm text-[var(--text-secondary)] truncate font-inter">{address}</p>

        {typeof location.distance === 'number' && (
          <p className="text-xs text-[var(--accent)] font-inter">
            {location.distance.toFixed(1)} mi from you
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {visibleTags.map((tag, i) => (
            <span
              key={tag}
              className="text-xs font-medium px-3 py-1 rounded-full bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </span>
          ))}

          {extraTagCount > 0 && (
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-inter">
              +{extraTagCount} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
