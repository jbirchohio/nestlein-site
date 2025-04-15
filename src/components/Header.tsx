'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  const isSlugPage = pathname?.startsWith('/locations/');

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200 shadow-sm transition-all duration-300`}>
      <div className={`max-w-7xl mx-auto px-4 ${isSlugPage ? 'py-2' : 'py-3'} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        {/* Logo */}
        <Link href="/" className="text-blue-600 font-bold text-xl sm:text-2xl">
          NestleIn
        </Link>

        {/* Conditionally render search on non-slug pages */}
        {!isSlugPage && (
          <input
            type="text"
            placeholder="Search locations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 max-w-xl w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        )}

        {!isSlugPage && (
          <div className="text-sm text-slate-500 hidden sm:block">
            <span className="px-2 py-1 rounded bg-slate-100">Filters</span>
          </div>
        )}
      </div>
    </header>
  );
}
