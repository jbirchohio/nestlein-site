import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getAllLocations, getLocationBySlug } from '@/lib/locations';

export async function generateStaticParams() {
  const locations = await getAllLocations();
  return locations.map(loc => ({ slug: loc.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const location = await getLocationBySlug(params.slug);
  if (!location) return {};

  return {
    title: `${location.name} | NestleIn`,
    description: `${location.name} is a remote work-friendly location in ${location.address}`,
  };
}

export default async function LocationPage({ params }: { params: { slug: string } }) {
  const location = await getLocationBySlug(params.slug);
  if (!location) return notFound();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Image
        src={location.logo_url || '/placeholder.jpg'}
        alt={location.name}
        width={800}
        height={400}
        className="w-full h-60 object-cover rounded mb-4"
      />
      <h1 className="text-3xl font-bold mb-2">{location.name}</h1>
      <p className="text-gray-600 mb-4">
        {location.address} — {location.hours || 'Hours not available'}
      </p>
      <div className="mb-4">
        {location.tags?.map(tag => (
          <span
            key={tag}
            className="inline-block bg-violet-100 text-violet-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
      <pre className="bg-gray-100 text-sm text-gray-800 p-4 rounded overflow-x-auto whitespace-pre-wrap">
        {location.remote_work_features
          ? JSON.stringify(location.remote_work_features, null, 2)
          : 'No additional details available.'}
      </pre>
    </div>
  );
}
