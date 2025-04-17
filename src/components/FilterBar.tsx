'use client';

import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react'; // ⬅️ Add this at the top

export default function FilterBar({
  locations,
  activeFilters,
  setActiveFilters,
}: {
  locations: { tags: string[] }[];
  activeFilters: string[];
  setActiveFilters: (tags: string[]) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    locations.forEach(loc => loc.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [locations]);

  const toggleTag = (tag: string) => {
    const exists = activeFilters.includes(tag);
    let updated = exists
      ? activeFilters.filter(t => t !== tag)
      : [...activeFilters, tag];

    // Limit to 4 tags total
    if (!exists && updated.length > 4) {
      updated = updated.slice(-4);
    }

    setActiveFilters(updated);
    if (!exists) setShowDropdown(false);
  };

  const availableTags = allTags.filter(tag => !activeFilters.includes(tag));
  const visibleTags = activeFilters.slice(0, 4); // Always show up to 4 selected

  return (
    <div className="flex flex-wrap gap-3 items-center mb-8 max-w-7xl mx-auto px-4 relative font-inter">
      {/* Active Filters */}
      {visibleTags.map(tag => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className="px-3 py-1 rounded-full text-sm font-medium bg-[var(--accent)] text-white border border-[var(--accent)] hover:brightness-110 transition-all"
        >
          {tag} ✕
        </button>
      ))}

      {/* More Button */}
      {availableTags.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border border-[var(--accent-light)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--accent-light)] transition"
          >
            <Filter size={16} /> More
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 z-10 mt-2 bg-[var(--background)] border border-[var(--accent-light)] rounded-xl shadow-xl p-2 max-h-64 overflow-y-auto w-52 space-y-1">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="block w-full text-left px-3 py-1 text-sm text-[var(--foreground)] hover:bg-[var(--accent-light)] rounded transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
