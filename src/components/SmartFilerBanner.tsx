'use client';

import { Clock, MapPin, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SmartFilterBanner({
  message,
}: {
  message: string | null;
}) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    setVisible(!!message);
  }, [message]);

  if (!visible || !message) return null;

  const getIcon = () => {
    if (message.toLowerCase().includes('open')) return <Clock size={16} />;
    if (message.toLowerCase().includes('near')) return <MapPin size={16} />;
    return <Search size={16} />;
  };

  return (
    <div className="flex items-center justify-between gap-3 mt-3 px-4 py-2 rounded-md bg-[var(--accent-light)] text-[var(--foreground)] text-sm font-medium transition-all duration-300 shadow-sm">
      <div className="flex items-center gap-2">
        {getIcon()}
        <span>{message}</span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-[var(--foreground)] hover:text-[var(--accent)] transition"
      >
        <X size={16} />
      </button>
    </div>
  );
}
