'use client';

import React, { useState, useMemo } from 'react';

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

    // Always show max 4
    if (!exists && updated.length > 4) {
      updated = updated.slice(-4);
    }

    setActiveFilters(updated);
    if (!exists) setShowDropdown(false);
  };

  const availableTags = allTags.filter(tag => !activeFilters.includes(tag));

  return (
    <div className="flex flex-wrap gap-2 items-center mb-6 max-w-7xl mx-auto px-4 relative">
      {activeFilters.map(tag => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className="px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white border border-blue-600"
        >
          {tag} ✕
        </button>
      ))}

      {availableTags.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-3 py-1 rounded-full text-sm font-medium border border-slate-300 bg-white text-slate-600 hover:bg-blue-100"
          >
            + More
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 z-10 mt-2 bg-white border border-slate-300 rounded-md shadow-lg p-2 max-h-64 overflow-y-auto w-48">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="block w-full text-left px-3 py-1 text-sm text-slate-700 hover:bg-blue-100 rounded"
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
