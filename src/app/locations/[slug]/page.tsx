import { getLocationBySlug } from '@/lib/locations';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function LocationPage({ params }: { params: { slug: string } }) {
  const location = await getLocationBySlug(params.slug);
  if (!location) return notFound();

  return (
    <div className="max-w-3xl mx-auto p-6">
      {location.logo_url && (
        <Image
          src={location.logo_url}
          alt={location.name}
          width={800}
          height={400}
          className="w-full h-60 object-cover rounded mb-4"
        />
      )}
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
