import { notFound } from 'next/navigation';
import { getLocationBySlug } from '@/lib/locations';
import Image from 'next/image';

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const locations = await import('@/lib/locations').then(m => m.getAllLocations());
  return locations.map(loc => ({ slug: loc.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const location = await getLocationBySlug(params.slug);
  if (!location) return {};

  return {
    title: `${location.name} | NestleIn`,
    description: `${location.name} is a remote work-friendly location in ${location.address}`,
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
      <p className="text-gray-600 mb-4">{location.address} — {location.hours}</p>
      <p>{location.description || 'This location is suitable for remote work.'}</p>
    </div>
  );
}
