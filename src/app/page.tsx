// /src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getAllLocations } from '@/lib/locations';

export const dynamic = 'force-static';

interface Location {
  slug: string;
  name: string;
  address: string;
  hours?: string;
  logo_url?: string;
  tags?: string[];
}

export default async function HomePage() {
  const locations: Location[] = await getAllLocations();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-800 px-4 py-8">
   
      {/* Location Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {locations.map((loc) => {
          const closingTime = loc.hours?.split('-')?.[1]?.trim() || 'N/A';
          const isOpen = true; // This should be replaced by dynamic time-based logic
          return (
            <Link
              key={loc.slug}
              href={`/locations/${loc.slug}`}
              className="bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 block"
            >
              <Image
                src={loc.logo_url || '/placeholder.jpg'}
                alt={loc.name}
                width={400}
                height={200}
                className="w-full h-44 object-cover rounded-t-xl"
              />
              <div className="p-5">
                <h2 className="text-xl font-semibold text-slate-900">{loc.name}</h2>
                <p className="text-sm text-slate-500">{loc.address}</p>
                <p className={`text-sm font-medium mt-2 ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {isOpen ? 'Open now' : 'Closed'} — until {closingTime}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {loc.tags?.map(tag => (
                    <span
                      key={tag}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
