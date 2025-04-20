'use client';

import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  message?: string;
}

export default function SmartFilterBanner({ message = 'Showing open spots near you' }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 200); // subtle fade in
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-[var(--accent-light)] text-[var(--accent-dark)] text-sm font-medium py-2 px-4 rounded-xl shadow-sm flex items-center gap-2 max-w-fit mx-auto mt-4 animate-fade-in">
      <Info size={16} className="text-[var(--accent-dark)]" />
      {message}
    </div>
  );
}
