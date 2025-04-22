// src/components/ClientOnly.tsx
'use client';

import dynamic from 'next/dynamic';

// this lives in a client component, so `ssr: false` is allowed
const ClientHome = dynamic(
  () => import('@/components/ClientHome'),
  { ssr: false }
);

export default function ClientOnly() {
  return <ClientHome />;
}
