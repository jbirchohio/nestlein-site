// app/(home)/page.tsx
import dynamic from 'next/dynamic';

// dynamically import your ClientHome _only_ on the client
const ClientHome = dynamic(() => import('@/components/ClientHome'), {
  ssr: false,
});

export default function Page() {
  return <ClientHome />;
}
