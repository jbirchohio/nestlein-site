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
    <div className="w-full">
  
      {/* Mobile Multi-Select Dropdown */}
      <div className="block md:hidden mb-4">
        <label htmlFor="tagFilter" className="text-sm font-medium text-gray-700 mb-1 block">
          Find your vibe
        </label>
        <select
          id="tagFilter"
          multiple
          className="w-full h-32 rounded-md border border-gray-300 py-2 px-3 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4F5E]"
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => opt.value);
            setActiveTags(selectedOptions);
          }}
          value={activeTags}
        >
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">Hold Ctrl (or Cmd) to select multiple</p>
      </div>
  
      {/* Tag Grid for Desktop */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-2">
        {tags.map((tag) => {
          const isSelected = activeTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => {
                if (isSelected) {
                  setActiveTags(activeTags.filter((t) => t !== tag));
                } else {
                  setActiveTags([...activeTags, tag]);
                }
              }}
              className={`px-3 py-1 text-sm rounded-full border border-gray-300 transition hover:bg-[#3ED6C0] hover:text-white ${
                isSelected ? 'bg-[#FF4F5E] text-white' : ''
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
  
    </div>
  );
  