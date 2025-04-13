// /src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getAllLocations } from '../lib/markdown';

export const dynamic = 'force-static';

export default async function HomePage() {
  const locations = getAllLocations();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar Filters */}
      <aside className="hidden md:block w-64 p-6 border-r border-gray-200 bg-white">
        <h2 className="text-lg font-semibold mb-4">Filter by</h2>
        {/* Tag checkboxes will go here */}
        <div className="space-y-2 text-sm text-gray-800">
          <label className="block">
            <input type="checkbox" className="mr-2" /> Quiet
          </label>
          <label className="block">
            <input type="checkbox" className="mr-2" /> Free Wi-Fi
          </label>
          <label className="block">
            <input type="checkbox" className="mr-2" /> Outlets
          </label>
        </div>
      </aside>

      <main className="flex-1 p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search locations..."
            className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map(loc => (
            <Link
              key={loc.slug}
              href={`/locations/${loc.slug}`}
              className="block bg-white border border-gray-200 rounded-md shadow hover:shadow-lg hover:-translate-y-1 transform transition p-4"
            >
              <Image
                src={loc.logo_url}
                alt={loc.title}
                width={400}
                height={200}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h2 className="text-xl font-semibold">{loc.title}</h2>
              <p className="text-sm text-gray-600">{loc.address}</p>
              <p className="text-sm text-violet-600 font-medium mt-1">
                Open now — until {loc.hours?.split('-')?.[1]?.trim()}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {loc.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2 py-1 bg-violet-100 text-violet-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
