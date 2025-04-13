// /src/app/locations/[slug]/page.tsx

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getLocationBySlug } from '@/lib/locations';

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const { getAllLocations } = await import('@/lib/locations');
  const locations = getAllLocations();
  return locations.map((loc) => ({ slug: loc.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const location = await getLocationBySlug(params.slug);
  if (!location) return {};
  return {
    title: `${location.name} | NestleIn`,
    description: `Discover ${location.name}, a work-friendly spot in ${location.address}.`,
  };
}

export default async function LocationPage({ params }: PageProps) {
  const location = await getLocationBySlug(params.slug);
  if (!location) return notFound();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Image
        src={location.logo_url}
        alt={location.name}
        width={800}
        height={400}
        className="w-full h-60 object-cover rounded mb-4"
      />
      <h1 className="text-3xl font-bold mb-2">{location.name}</h1>
      <p className="text-gray-600 mb-4">
        {location.address} — {location.hours}
      </p>
      <div className="mt-4 space-y-2">
        {location.tags?.map((tag) => (
          <span
            key={tag}
            className="inline-block text-xs font-medium px-2 py-1 bg-violet-100 text-violet-800 rounded-full mr-2"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
