'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

interface FilterBarProps {
  tags: string[];
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
}

export default function FilterBar({ tags, activeTag, setActiveTag }: FilterBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  if (!mounted || tags.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 mt-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 text-[var(--foreground-muted)] text-sm font-semibold">
          <SlidersHorizontal size={16} />
          Filter by tag:
        </div>

        {tags.map((tag) => {
          const selected = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(selected ? null : tag)}
              className={`text-sm px-3 py-1.5 rounded-full font-medium transition border ${
                selected
                  ? 'bg-[var(--accent)] text-white border-[var(--accent-dark)]'
                  : 'bg-[var(--background)] text-[var(--foreground-muted)] hover:bg-[var(--accent-light)] border-[var(--accent-light)]'
              }`}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          );
        })}

        {activeTag && (
          <button
            onClick={() => setActiveTag(null)}
            className="flex items-center gap-1 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition ml-2"
          >
            <X size={16} />
            Clear
          </button>
        )}
      </div>
    </section>
  );
}
