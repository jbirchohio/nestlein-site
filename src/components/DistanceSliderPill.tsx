'use client';

import { Popover } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

interface Props {
  distance: number;
  setDistance: (miles: number) => void;
}

export default function DistanceSliderPill({ distance, setDistance }: Props) {
  return (
    <Popover className="relative">
      {/* Pill Trigger */}
      <Popover.Button className="flex items-center gap-1 px-3 py-1 text-sm rounded-full border border-gray-300 hover:bg-[#3ED6C0] hover:text-white transition">
        Distance
        <ChevronDown className="w-4 h-4" />
      </Popover.Button>

      {/* Dropdown Panel */}
      <Popover.Panel
        className="absolute z-10 mt-2 w-64 p-4 bg-white border border-gray-200 shadow-xl rounded-xl sm:right-0 sm:top-full"
        static
      >
        <div className="text-sm font-semibold text-gray-800 mb-2">Distance</div>
        <input
          type="range"
          min={1}
          max={50}
          step={1}
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full"
        />
        <div className="mt-2 text-center text-sm text-gray-600">
          Within <span className="font-medium">{distance}</span> mile{distance !== 1 && 's'}
        </div>
      </Popover.Panel>
    </Popover>
  );
}
