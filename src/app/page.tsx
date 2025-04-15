// /src/app/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getAllLocations } from '@/lib/locations';

export const dynamic = 'force-static';

interface Location {
  slug: string;
  name: string;
  address: string;
  hours?: string;
  logo_url?: string;
  tags?: string[];
  best_time_to_work_remotely?: string;
}

export default async function HomePage() {
  const locations: Location[] = await getAllLocations();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Filters */}
      <aside className="hidden md:block w-64 p-6 border-r border-gray-200 bg-white dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Filter by</h2>
        <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
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
            className="w-full max-w-xl px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
          />
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc: Location) => (
            <Link
              key={loc.slug}
              href={`/locations/${loc.slug}`}
              className="block bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md shadow hover:shadow-lg hover:-translate-y-1 transform transition p-4"
            >
              <Image
                src={loc.logo_url || '/placeholder.jpg'}
                alt={loc.name}
                width={400}
                height={200}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{loc.name}</h2>
              <p className="text-sm text-gray-600 dark:text-zinc-400">{loc.address}</p>
              {loc.hours && (
                <p className="text-sm text-violet-600 dark:text-violet-400 font-medium mt-1">
                  Open now — until {loc.hours?.split('-')?.[1]?.trim() || 'N/A'}
                </p>
              )}
              {loc.best_time_to_work_remotely && (
                <p className="text-sm text-violet-500 dark:text-violet-300 font-medium">
                  💡 {loc.best_time_to_work_remotely}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {loc.tags?.map(tag => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2 py-1 bg-violet-100 dark:bg-violet-700 text-violet-800 dark:text-white rounded-full"
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
