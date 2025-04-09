// src/components/LucideIcon.jsx
import { Icon } from '@iconify/react';

export default function LucideIcon({ name, size = 20, className = "text-orange-600" }) {
  return (
    <Icon
      icon={`lucide:${name}`}
      width={size}
      height={size}
      className={className}
    />
  );
}
