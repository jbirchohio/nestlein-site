'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterBarProps {
  tags: string[];
  activeTags: string[];
  setActiveTags: (tags: string[]) => void;
}

export default function FilterBar({ tags, activeTags, setActiveTags }: FilterBarProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter((t) => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };

  // Split tags
  const mobileVisibleTags = tags.slice(0, 3);
  const desktopVisibleTags = tags.slice(0, 6);
  const hiddenTags = tags.slice(6);

  return (
    <div className="w-full relative">

      {/* Mobile Buttons */}
      <div className="flex md:hidden flex-wrap gap-2 mb-2">
        {mobileVisibleTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 text-sm rounded-full border border-gray-300 ${
              activeTags.includes(tag) ? 'bg-[#FF4F5E] text-white' : 'hover:bg-[#3ED6C0] hover:text-white'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-2 mb-2">
        {desktopVisibleTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 text-sm rounded-full border border-gray-300 ${
              activeTags.includes(tag) ? 'bg-[#FF4F5E] text-white' : 'hover:bg-[#3ED6C0] hover:text-white'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Toggle Dropdown */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="text-sm text-[#FF4F5E] flex items-center gap-1"
        >
          More Filters <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown with remaining tags */}
      {showDropdown && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-2 border-t pt-4">
          {hiddenTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 text-sm rounded-full border border-gray-300 ${
                activeTags.includes(tag) ? 'bg-[#FF4F5E] text-white' : 'hover:bg-[#3ED6C0] hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
