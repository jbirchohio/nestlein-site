'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, MapPinned, Star, Filter, Wand2, PlusCircle } from 'lucide-react';

const navItems = [
  { label: 'Search', href: '/', icon: <Search size={18} /> },
  { label: 'Browse', href: '/browse', icon: <MapPinned size={18} /> },
  { label: 'Favorites', href: '/favorites', icon: <Star size={18} /> },
  { label: 'Suggest', href: '/suggest', icon: <Wand2 size={18} /> },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur border-b border-[var(--accent-light)] bg-[var(--background)/80]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold font-satoshi text-[var(--accent)] tracking-tight"
        >
          Roamly
        </Link>

        <nav className="hidden sm:flex gap-3 items-center text-sm font-medium text-[var(--foreground-muted)]">
          {navItems.map(({ label, href, icon }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-[var(--accent-light)] ${
                pathname === href ? 'bg-[var(--accent-light)] text-[var(--accent-dark)]' : ''
              }`}
            >
              {icon}
              {label}
            </Link>
          ))}

          <Link
            href="/filters"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-[var(--accent-light)]"
          >
            <Filter size={18} /> Filters
          </Link>
        </nav>

        <Link
          href="/suggest"
          className="sm:hidden inline-flex items-center justify-center bg-[var(--accent)] text-white rounded-full p-2 shadow hover:opacity-90 transition"
        >
          <PlusCircle size={20} />
        </Link>
      </div>
    </header>
  );
}
