'use client';

import { useState } from 'react';

const FILTER_TAGS = ['Quiet', 'Free Wi-Fi', 'Outlets', 'Natural Light', 'Parking'];

export default function FilterBar({
  activeFilters,
  setActiveFilters,
}: {
  activeFilters: string[];
  setActiveFilters: (tags: string[]) => void;
}) {
  const toggleTag = (tag: string) => {
    setActiveFilters(
      activeFilters.includes(tag)
        ? activeFilters.filter(t => t !== tag)
        : [...activeFilters, tag]
    );
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6 max-w-7xl mx-auto px-4">
      {FILTER_TAGS.map(tag => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200 ${
            activeFilters.includes(tag)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-600 border-slate-300 hover:bg-blue-100'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
