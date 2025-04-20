'use client';

import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

interface Props {
  distance: number;
  setDistance: (miles: number) => void;
}

export default function DistanceSliderPill({ distance, setDistance }: Props) {
  return (
    <Popover className="relative z-50">
      {/* Pill Trigger */}
      <Popover.Button className="flex items-center gap-1 px-3 py-1 text-sm rounded-full border border-gray-300 hover:bg-[#3ED6C0] hover:text-white transition">
        Distance
        <ChevronDown className="w-4 h-4" />
      </Popover.Button>

      {/* Animated Dropdown Panel */}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
      <Popover className="relative z-[60]">
        <Popover.Button className="...">Distance <ChevronDown /></Popover.Button>

        <Transition ...>
          <Popover.Panel
            className="absolute right-0 mt-4 w-72 p-4 bg-white border shadow-xl rounded-xl"
          >
            <div className="text-sm font-semibold text-gray-800 mb-2">Distance</div>
            <input type="range" ... />
            <div className="mt-2 text-center text-sm text-gray-600">
              Within {distance} mile{distance !== 1 && 's'}
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>

  );
}
